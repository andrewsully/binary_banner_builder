#!/usr/bin/env python3
"""
Flask web server for binary banner generator
"""
import os
import io
import base64
import time
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
from PIL import Image
import banner_renderer

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main UI page"""
    return render_template('index.html')

@app.route('/api/upload_mask', methods=['POST'])
def upload_mask():
    """Handle mask image upload"""
    if 'mask' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['mask']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get original image dimensions
        img = Image.open(filepath)
        original_width, original_height = img.size
        
        # Return full-resolution preview (base64 encoded, using nearest neighbor for masks)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'filename': filename,
            'preview': f'data:image/png;base64,{img_str}',
            'width': original_width,
            'height': original_height
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/save_edited_mask', methods=['POST'])
def save_edited_mask():
    """Save the edited mask from the canvas editor"""
    try:
        data = request.json
        image_data = data.get('image_data')  # Base64 encoded image
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Remove the data URL prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Generate filename
        filename = f'edited_mask_{int(time.time())}.png'
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        # Create preview
        img = Image.open(filepath)
        img.thumbnail((200, 200))
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'filename': filename,
            'preview': f'data:image/png;base64,{img_str}'
        })
    except Exception as e:
        print(f"Error saving edited mask: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/render', methods=['POST'])
def render_banner():
    """Render the banner with given parameters"""
    try:
        data = request.json
        
        # Extract parameters
        mask_filename = data.get('mask_filename')
        
        # Handle different mask types
        if mask_filename == 'arrow':
            mask_path = 'masks/arrow_mask.png'
        elif mask_filename == 'skyline':
            mask_path = 'masks/finalmask.png'
        elif mask_filename == 'border':
            mask_path = 'masks/empty_middle.png'
        elif mask_filename == 'nomask':
            mask_path = 'masks/nomask.png'
        elif mask_filename == 'triangles':
            mask_path = 'masks/triangles.png'
        elif mask_filename and mask_filename != 'null':
            # Custom uploaded mask
            mask_path = os.path.join(app.config['UPLOAD_FOLDER'], mask_filename)
        else:
            # No mask selected - return error
            return jsonify({'error': 'No mask selected. Please select a mask in Step 1.'}), 400
        
        # Canvas settings
        canvas_width = int(data.get('canvas_width', 1584))
        canvas_height = int(data.get('canvas_height', 396))
        mask_fit = data.get('mask_fit', 'stretch')
        
        # Grid settings
        font_size = int(data.get('font_size', 10))
        horizontal_spacing = int(data.get('horizontal_spacing', 0))
        vertical_spacing = int(data.get('vertical_spacing', 6))
        font_family = data.get('font_family', 'courier')
        bold_digits = data.get('bold_digits', False)
        font_color = data.get('font_color', '#FFFFFF')
        
        # Advanced settings
        resolution = int(data.get('resolution', 4))
        apply_blur = data.get('apply_blur', True)
        clip_threshold = float(data.get('clip_threshold', 0.68))
        background_color = data.get('background_color', '#000000')
        
        # Text zones
        text_zones = data.get('text_zones', [])
        # Format: [{'zone': 'top_left', 'text': 'Hello', 'font_size': 18, 'color': '#FFFFFF', 'bold': False, 'align': 'left'}, ...]
        
        # Render the banner
        output_filename = 'banner_output.png'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        result_image = banner_renderer.render_banner(
            mask_path=mask_path,
            canvas_width=canvas_width,
            canvas_height=canvas_height,
            mask_fit=mask_fit,
            font_size=font_size,
            horizontal_spacing=horizontal_spacing,
            vertical_spacing=vertical_spacing,
            font_family=font_family,
            bold_digits=bold_digits,
            font_color=font_color,
            resolution=resolution,
            apply_blur=apply_blur,
            clip_threshold=clip_threshold,
            background_color=background_color,
            text_zones=text_zones
        )
        
        # Save result
        result_image.save(output_path, 'PNG')
        
        # Return base64 preview
        buffered = io.BytesIO()
        result_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'preview': f'data:image/png;base64,{img_str}',
            'download_url': f'/api/download/{output_filename}'
        })
        
    except Exception as e:
        import traceback
        print(f"Error rendering banner: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview_grid', methods=['POST'])
def preview_grid():
    """Generate a preview of the digit grid without mask clipping"""
    try:
        data = request.json
        
        # Extract parameters
        canvas_width = int(data.get('canvas_width', 1584))
        canvas_height = int(data.get('canvas_height', 396))
        font_size = int(data.get('font_size', 10))
        horizontal_spacing = int(data.get('horizontal_spacing', 0))
        vertical_spacing = int(data.get('vertical_spacing', 6))
        font_family = data.get('font_family', 'courier')
        bold_digits = data.get('bold_digits', False)
        font_color = data.get('font_color', '#FFFFFF')
        background_color = data.get('background_color', '#000000')
        
        # Generate grid preview at lower resolution for speed
        resolution = 2  # Fixed at 2x for preview
        
        # Convert background color from hex to RGB tuple
        bg_rgb = tuple(int(background_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        
        # Create background with specified color
        result_image = banner_renderer.Image.new("RGB", 
                                                (canvas_width * resolution, canvas_height * resolution), 
                                                bg_rgb)
        
        # Generate full digit pattern without mask
        pattern, grid, placements = banner_renderer.make_binary_texture(
            canvas_width, canvas_height,
            font_size=font_size,
            horizontal_spacing=horizontal_spacing,
            vertical_spacing=vertical_spacing,
            mask_arr=None,  # No mask for preview
            scale_factor=resolution,
            apply_blur=True,
            clip_threshold=1.0,
            font_family=font_family,
            bold=bold_digits
        )
        
        # Draw all digits
        draw_result = banner_renderer.ImageDraw.Draw(result_image)
        digit_font = banner_renderer.load_mono_font(int(font_size * resolution), font_family=font_family, bold=bold_digits)
        
        # Convert hex color to RGB tuple
        color_rgb = tuple(int(font_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        
        for (px, py, dg) in placements:
            draw_result.text((px, py), dg, font=digit_font, fill=color_rgb)
        
        # Return full quality image for preview
        buffered = io.BytesIO()
        result_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'preview': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        import traceback
        print(f"Error generating grid preview: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/mask/<mask_type>')
def get_mask(mask_type):
    """Serve preset mask images"""
    mask_paths = {
        'arrow': 'masks/arrow_mask.png',
        'skyline': 'masks/finalmask.png',
        'border': 'masks/empty_middle.png',
        'nomask': 'masks/nomask.png',
        'triangles': 'masks/triangles.png'
    }
    
    if mask_type not in mask_paths:
        return jsonify({'error': 'Invalid mask type'}), 404
    
    mask_path = mask_paths[mask_type]
    
    if os.path.exists(mask_path):
        return send_file(mask_path, mimetype='image/png')
    else:
        # If mask doesn't exist, return a placeholder
        from PIL import Image
        img = Image.new('L', (1584, 396), 255)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        buffered.seek(0)
        return send_file(buffered, mimetype='image/png')

@app.route('/api/download/<filename>')
def download_file(filename):
    """Download the generated banner"""
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True, download_name=filename)
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    print("Starting Binary Banner Generator Web Server...")
    print("Open http://localhost:5001 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5001)

