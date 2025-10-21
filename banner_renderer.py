#!/usr/bin/env python3
"""
Refactored banner rendering module - functional API for web interface
"""
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def load_mono_font(pixel_size: int, font_family: str = "courier", bold: bool = False):
    """Load a monospace font"""
    font_paths = {
        "courier": [
            ("/System/Library/Fonts/Courier.ttc", 1 if bold else 0),
            ("/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf", None),
        ],
        "menlo": [
            ("/System/Library/Fonts/Menlo.ttc", 1 if bold else 0),
        ],
        "monaco": [
            ("/System/Library/Fonts/Monaco.ttf", None),
        ],
        "consolas": [
            ("/usr/share/fonts/truetype/consolas/CONSOLAB.TTF" if bold else "/usr/share/fonts/truetype/consolas/CONSOLA.TTF", None),
            ("C:\\Windows\\Fonts\\consolab.ttf" if bold else "C:\\Windows\\Fonts\\consola.ttf", None),
        ],
        "jetbrains": [
            ("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf", None),
            ("/System/Library/Fonts/Supplemental/JetBrainsMono-Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/JetBrainsMono-Regular.ttf", None),
        ],
    }
    
    if font_family.lower() in font_paths:
        for font_path, index in font_paths[font_family.lower()]:
            try:
                if index is not None:
                    return ImageFont.truetype(font_path, int(pixel_size), index=index)
                else:
                    return ImageFont.truetype(font_path, int(pixel_size))
            except Exception:
                continue
    
    # Fallback
    try:
        return ImageFont.truetype("/System/Library/Fonts/Courier.ttc", int(pixel_size), index=(1 if bold else 0))
    except Exception:
        return ImageFont.load_default()

def load_mask(path, canvas_width, canvas_height, scale_factor=1, fit_mode="contain"):
    """Load and fit mask to canvas"""
    m = Image.open(path)
    w, h = canvas_width * scale_factor, canvas_height * scale_factor
    
    # Handle transparency
    if m.mode in ('RGBA', 'LA', 'PA'):
        bg = Image.new('RGB', m.size, (0, 0, 0))
        bg.paste(m, mask=m.split()[-1])
        m = bg
    
    m = m.convert('L')
    orig_w, orig_h = m.size
    
    if fit_mode == "stretch":
        m = m.resize((w, h), Image.LANCZOS)
        canvas = m
    elif fit_mode == "cover":
        scale_w = w / orig_w
        scale_h = h / orig_h
        scale = max(scale_w, scale_h)
        new_w = int(orig_w * scale)
        new_h = int(orig_h * scale)
        m = m.resize((new_w, new_h), Image.LANCZOS)
        offset_x = (new_w - w) // 2
        offset_y = (new_h - h) // 2
        m = m.crop((offset_x, offset_y, offset_x + w, offset_y + h))
        canvas = m
    else:  # contain
        target_aspect = w / h
        mask_aspect = orig_w / orig_h
        
        if abs(orig_w - w) < 10 and abs(orig_h - h) < 10:
            m = m.resize((w, h), Image.LANCZOS)
            canvas = m
        elif abs(mask_aspect - target_aspect) / target_aspect < 0.1:
            m = m.resize((w, h), Image.LANCZOS)
            canvas = m
        else:
            scale_w = w / orig_w
            scale_h = h / orig_h
            scale = min(scale_w, scale_h)
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            m = m.resize((new_w, new_h), Image.LANCZOS)
            canvas = Image.new('L', (w, h), 0)
            offset_x = (w - new_w) // 2
            offset_y = (h - new_h) // 2
            canvas.paste(m, (offset_x, offset_y))
    
    # Threshold
    arr = np.array(canvas)
    arr = (arr > 128).astype(np.uint8) * 255
    return Image.fromarray(arr, mode='L')

def parse_hex(color: str):
    """Convert hex color to RGB tuple"""
    color = color.strip().lstrip('#')
    if len(color) == 3:
        color = ''.join([c*2 for c in color])
    r = int(color[0:2], 16)
    g = int(color[2:4], 16)
    b = int(color[4:6], 16)
    return (r, g, b)

def get_zone_position(zone_name, canvas_width, canvas_height, text_width, text_height, scale_factor=1):
    """Calculate x,y position for a given zone"""
    w = canvas_width * scale_factor
    h = canvas_height * scale_factor
    margin = int(24 * scale_factor)
    
    # Vertical positioning
    if zone_name.startswith('top_'):
        y = margin
    elif zone_name.startswith('middle_'):
        y = (h - text_height) // 2
    else:  # bottom_
        y = h - margin - text_height
    
    # Horizontal positioning
    if zone_name.endswith('_left'):
        x = margin
    elif zone_name.endswith('_center'):
        x = (w - text_width) // 2
    else:  # _right
        x = w - margin - text_width
    
    return x, y

def add_text_zones(result_img, mask_img, text_zones, canvas_width, canvas_height, 
                   scale_factor, digit_font_size, digit_h_spacing, digit_v_spacing, 
                   font_family="courier"):
    """
    Add text zones to the image and reserve their areas in the mask.
    
    text_zones format: [
        {
            'zone': 'top_left',
            'text': 'Hello World',
            'font_size': 18,
            'color': '#FFFFFF',
            'bold': False,
            'align': 'left'
        },
        ...
    ]
    """
    w, h = result_img.size
    draw_res = ImageDraw.Draw(result_img)
    draw_mask = ImageDraw.Draw(mask_img)
    
    # Calculate digit grid parameters for grid-snapping
    digit_font = load_mono_font(int(digit_font_size * scale_factor), font_family=font_family)
    base_bbox = draw_res.textbbox((0, 0), "0", font=digit_font)
    base_h = base_bbox[3] - base_bbox[1]
    extra_v = int(digit_v_spacing * scale_factor)
    line_spacing = base_h + extra_v
    char_h = base_h
    
    # Generate row positions
    row_tops = [i * line_spacing for i in range(h // line_spacing + 1)]
    row_bottoms = [y + char_h for y in row_tops]
    
    for zone_config in text_zones:
        zone_name = zone_config.get('zone', 'middle_center')
        text = zone_config.get('text', '')
        if not text.strip():
            continue
            
        font_size = int(zone_config.get('font_size', 18))
        color = zone_config.get('color', '#FFFFFF')
        bold = zone_config.get('bold', False)
        capitalize = zone_config.get('capitalize', False)
        align = zone_config.get('align', 'left')
        y_offset = int(zone_config.get('y_offset', 0) * scale_factor)  # Scale the offset
        x_offset = int(zone_config.get('x_offset', 0) * scale_factor)  # Scale the offset
        
        # Apply capitalization if requested
        if capitalize:
            text = text.upper()
        
        color_rgb = parse_hex(color)
        font = load_mono_font(int(font_size * scale_factor), font_family=font_family, bold=bold)
        
        # Handle multiline text
        lines = text.split('\n')
        
        line_bboxes = []
        line_widths = []
        line_heights = []
        
        for line in lines:
            bbox = draw_res.textbbox((0, 0), line, font=font)
            line_bboxes.append(bbox)
            line_widths.append(bbox[2] - bbox[0])
            line_heights.append(bbox[3] - bbox[1])
        
        # Calculate total text dimensions
        text_w = max(line_widths) if line_widths else 0
        single_line_h = line_heights[0] if line_heights else 0
        internal_line_spacing = int(single_line_h * 0.8)
        text_h = sum(line_heights) + internal_line_spacing * max(0, len(lines) - 1)
        
        # Get base position from zone using TOTAL block height
        base_x, base_y = get_zone_position(zone_name, canvas_width, canvas_height, 
                                          text_w, text_h, scale_factor)
        
        # Apply user-defined offsets
        base_x += x_offset
        base_y += y_offset
        
        # Find intersecting rows for grid-snapping
        intended_bottom = base_y + text_h
        intersecting_rows = [i for i, (top, bot) in enumerate(zip(row_tops, row_bottoms))
                           if bot > base_y and top < intended_bottom]
        
        # Snap to grid if rows intersect
        if intersecting_rows:
            first_row_top = row_tops[intersecting_rows[0]]
            last_row_bottom = row_bottoms[intersecting_rows[-1]]
            snapped_y = (first_row_top + last_row_bottom) // 2 - text_h // 2
        else:
            snapped_y = base_y
        
        # Render each line
        current_y = snapped_y
        for i, line in enumerate(lines):
            line_h = line_heights[i]
            line_w = line_widths[i]
            
            # Apply horizontal alignment
            if align == "left":
                line_x = base_x
            elif align == "right":
                line_x = base_x + (text_w - line_w)
            else:  # center
                line_x = base_x + (text_w - line_w) // 2
            
            # Reserve area in mask
            draw_mask.rectangle([line_x, current_y, line_x + line_w, current_y + line_h], fill=0)
            
            # Draw text
            draw_res.text((line_x, current_y), line, font=font, fill=color_rgb)
            
            current_y += line_h + (internal_line_spacing if i < len(lines) - 1 else 0)
    
    return result_img, mask_img

def make_binary_texture(canvas_width, canvas_height, font_size=18, horizontal_spacing=0, 
                       vertical_spacing=0, mask_arr=None, scale_factor=1, apply_blur=True, 
                       clip_threshold=0.68, font_family="courier", bold=False):
    """Generate the binary 0/1 digit texture"""
    scaled_font_size = int(font_size * scale_factor)
    w, h = canvas_width * scale_factor, canvas_height * scale_factor
    
    font = load_mono_font(scaled_font_size, font_family=font_family, bold=bold)
    pattern = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(pattern)
    placements = []
    
    # Get character dimensions
    base_bbox = draw.textbbox((0, 0), "0", font=font)
    base_w = base_bbox[2] - base_bbox[0]
    base_h = base_bbox[3] - base_bbox[1]
    
    extra_h = int(horizontal_spacing * scale_factor)
    extra_v = int(vertical_spacing * scale_factor)
    
    char_w = base_w + extra_h
    line_spacing = base_h + extra_v
    char_height = base_h
    char_width = base_w
    
    # Fill canvas with random digits
    y = 0
    while y < h + scaled_font_size:
        x = 0
        while x < w + char_w:
            digit = random.choice(['0', '1'])
            
            # Check visibility if mask is provided
            if mask_arr is not None:
                bx1, by1 = int(x), int(y)
                bx2, by2 = int(x + char_width), int(y + char_height)
                
                fully_in_bounds = bx1 >= 0 and by1 >= 0 and bx2 <= w and by2 <= h and bx1 < bx2 and by1 < by2
                
                if fully_in_bounds:
                    digit_area = mask_arr[by1:by2, bx1:bx2]
                    if digit_area.size > 0:
                        coverage = float(np.count_nonzero(digit_area)) / float(digit_area.size)
                        if coverage >= clip_threshold:
                            draw.text((x, y), digit, font=font, fill=255)
                            placements.append((int(x), int(y), digit))
            else:
                draw.text((x, y), digit, font=font, fill=255)
                placements.append((int(x), int(y), digit))
            
            x += char_w
        y += line_spacing
    
    # Optional blur
    if apply_blur:
        blur_amount = 0.15 * scale_factor
        pattern = pattern.filter(ImageFilter.GaussianBlur(blur_amount))
    
    meta = {
        "char_w": char_w,
        "char_h": char_height,
        "line_spacing": line_spacing
    }
    
    return pattern, meta, placements

def render_banner(mask_path, canvas_width=1584, canvas_height=396, mask_fit='stretch',
                 font_size=10, horizontal_spacing=0, vertical_spacing=6,
                 font_family='courier', bold_digits=False, font_color='#FFFFFF', resolution=4,
                 apply_blur=True, clip_threshold=0.68, background_color='#000000', text_zones=None):
    """
    Main rendering function - creates a banner with binary digits and text zones.
    
    Args:
        mask_path: Path to mask image
        canvas_width: Output width (before resolution multiplier)
        canvas_height: Output height (before resolution multiplier)
        mask_fit: How to fit mask ('stretch', 'contain', 'cover')
        font_size: Digit font size
        horizontal_spacing: Extra pixels between digits
        vertical_spacing: Extra pixels between rows
        font_family: Font name
        bold_digits: Whether digits should be bold
        resolution: Resolution multiplier (1, 2, or 4)
        apply_blur: Apply blur for smoothing
        clip_threshold: Coverage threshold for digit visibility
        text_zones: List of text zone configurations
    
    Returns:
        PIL Image object
    """
    text_zones = text_zones or []
    scale_factor = resolution
    
    # Load mask
    mask = load_mask(mask_path, canvas_width, canvas_height, 
                    scale_factor=scale_factor, fit_mode=mask_fit)
    
    # Create base result image
    w, h = canvas_width * scale_factor, canvas_height * scale_factor
    
    # Convert hex background color to RGB tuple
    bg_color = background_color.lstrip('#')
    bg_rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
    
    # Convert hex font color to RGB tuple
    fg_color = font_color.lstrip('#')
    fg_rgb = tuple(int(fg_color[i:i+2], 16) for i in (0, 2, 4))
    
    result = Image.new("RGB", (w, h), bg_rgb)
    
    # Add text zones and reserve their areas in mask
    if text_zones:
        result, mask = add_text_zones(
            result, mask, text_zones, canvas_width, canvas_height,
            scale_factor, font_size, horizontal_spacing, vertical_spacing,
            font_family
        )
    
    # Generate digit pattern
    mask_arr = np.array(mask)
    pattern, grid, placements = make_binary_texture(
        canvas_width, canvas_height,
        font_size=font_size,
        horizontal_spacing=horizontal_spacing,
        vertical_spacing=vertical_spacing,
        mask_arr=mask_arr,
        scale_factor=scale_factor,
        apply_blur=apply_blur,
        clip_threshold=clip_threshold,
        font_family=font_family,
        bold=bold_digits
    )
    
    # Render digits where mask allows
    draw_result = ImageDraw.Draw(result)
    digit_font = load_mono_font(int(font_size * scale_factor), font_family=font_family, bold=bold_digits)
    
    for (px, py, dg) in placements:
        center_x = int(px + grid["char_w"] // 2)
        center_y = int(py + grid["char_h"] // 2)
        
        if center_x < w and center_y < h and mask_arr[center_y, center_x] > 0:
            draw_result.text((px, py), dg, font=digit_font, fill=fg_rgb)
    
    return result

