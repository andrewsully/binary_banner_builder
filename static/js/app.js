// State management
const state = {
    currentStep: 0,
    totalSteps: 5,
    maskFilename: null,  // No mask selected by default
    maskType: null,      // 'arrow', 'skyline', 'border', 'nomask', 'triangles', or 'custom'
    textZones: {},
    currentEditingZone: null,
    completedSteps: [],
    pendingNavigationStep: null,  // For unsaved changes modal
    currentBannerPreview: null,  // Store current banner preview URL
    // Mask editor state
    maskEditor: {
        originalImage: null,
        currentImage: null,
        canvas: null,
        ctx: null,
        threshold: 128,
        invert: false,  // Invert black/white
        fitMode: 'stretch',  // Default to stretch mode
        brushSize: 20,
        brushColor: 'white',
        isDrawing: false,
        brushLayer: null,  // Separate layer for brush edits
        brushInitialized: false,  // Track if event listeners are set up
        hasUnsavedChanges: false  // Track if user made changes without saving
    }
};

// DOM Elements
const elements = {
    // Wizard navigation
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    progressSteps: document.querySelectorAll('.progress-step'),
    wizardSteps: document.querySelectorAll('.wizard-step'),
    
    // Canvas settings
    presetSize: document.getElementById('preset-size'),
    canvasWidth: document.getElementById('canvas-width'),
    canvasHeight: document.getElementById('canvas-height'),
    maskArrow: document.getElementById('mask-arrow'),
    maskSkyline: document.getElementById('mask-skyline'),
    maskBorder: document.getElementById('mask-border'),
    maskNomask: document.getElementById('mask-nomask'),
    maskTriangles: document.getElementById('mask-triangles'),
    maskCustom: document.getElementById('mask-custom'),
    maskUpload: document.getElementById('mask-upload'),
    maskPreview: document.getElementById('mask-preview'),
    canvasShapePreview: document.getElementById('canvas-shape-preview'),
    canvasDimensionsDisplay: document.getElementById('canvas-dimensions-display'),
    canvasRatioDisplay: document.getElementById('canvas-ratio-display'),
    canvasMaskImage: document.getElementById('canvas-mask-image'),
    canvasPlaceholder: document.getElementById('canvas-placeholder'),
    
    // Mask editor (Step 2)
    maskEditorCanvas: document.getElementById('mask-editor-canvas'),
    maskEditorLoading: document.getElementById('mask-editor-loading'),
    brushCursor: document.getElementById('brush-cursor'),
    thresholdSlider: document.getElementById('threshold-slider'),
    thresholdValue: document.getElementById('threshold-value'),
    invertMask: document.getElementById('invert-mask'),
    fitContain: document.getElementById('fit-contain'),
    fitCover: document.getElementById('fit-cover'),
    fitStretch: document.getElementById('fit-stretch'),
    brushWhite: document.getElementById('brush-white'),
    brushBlack: document.getElementById('brush-black'),
    brushSize: document.getElementById('brush-size'),
    brushSizeValue: document.getElementById('brush-size-value'),
    clearBrush: document.getElementById('clear-brush'),
    resetMask: document.getElementById('reset-mask'),
    applyMaskChanges: document.getElementById('apply-mask-changes'),
    
    // Grid settings
    fontFamily: document.getElementById('font-family'),
    fontSize: document.getElementById('font-size'),
    fontSizeValue: document.getElementById('font-size-value'),
    horizontalSpacing: document.getElementById('horizontal-spacing'),
    hSpacingValue: document.getElementById('h-spacing-value'),
    verticalSpacing: document.getElementById('vertical-spacing'),
    vSpacingValue: document.getElementById('v-spacing-value'),
    boldDigits: document.getElementById('bold-digits'),
    gridFontColor: document.getElementById('grid-font-color'),
    gridBackgroundColor: document.getElementById('grid-background-color'),
    previewGridBtn: document.getElementById('preview-grid-btn'),
    gridPreviewContainer: document.getElementById('grid-preview-container'),
    gridLoading: document.getElementById('grid-loading'),
    
    // Advanced settings
    resolution: document.getElementById('resolution'),
    applyBlur: document.getElementById('apply-blur'),
    clipThreshold: document.getElementById('clip-threshold'),
    clipThresholdValue: document.getElementById('clip-threshold-value'),
    
    // Actions
    renderBtn: document.getElementById('render-btn'),
    loading: document.getElementById('loading'),
    downloadBtn: document.getElementById('download-btn'),
    
    // Preview
    previewContainer: document.getElementById('preview-container'),
    previewLinkedin: document.getElementById('preview-linkedin'),
    previewBasic: document.getElementById('preview-basic'),
    
    // Zone editor
    zoneGrid: document.querySelector('.zone-grid'),
    zoneCells: document.querySelectorAll('.zone-cell'),
    activeZonesList: document.getElementById('active-zones-list'),
    zonePreviewCanvas: document.getElementById('zone-preview-canvas'),
    zoneLivePreview: document.getElementById('zone-live-preview'),
    zoneModal: document.getElementById('zone-modal'),
    modalZoneName: document.getElementById('modal-zone-name'),
    zoneText: document.getElementById('zone-text'),
    zoneFontSize: document.getElementById('zone-font-size'),
    zoneColor: document.getElementById('zone-color'),
    zoneYOffset: document.getElementById('zone-y-offset'),
    zoneYOffsetValue: document.getElementById('y-offset-value'),
    zoneXOffset: document.getElementById('zone-x-offset'),
    zoneXOffsetValue: document.getElementById('x-offset-value'),
    zoneBold: document.getElementById('zone-bold'),
    zoneCapitalize: document.getElementById('zone-capitalize'),
    zoneAlign: document.getElementById('zone-align'),
    zoneSave: document.getElementById('zone-save'),
    zoneDelete: document.getElementById('zone-delete'),
    modalClose: document.querySelector('.modal-close'),
    
    // Bulk zone editor
    bulkZoneModal: document.getElementById('bulk-zone-modal'),
    bulkApplyFontSize: document.getElementById('bulk-apply-font-size'),
    bulkFontSize: document.getElementById('bulk-font-size'),
    bulkApplyColor: document.getElementById('bulk-apply-color'),
    bulkColor: document.getElementById('bulk-color'),
    bulkApplyYOffset: document.getElementById('bulk-apply-y-offset'),
    bulkYOffset: document.getElementById('bulk-y-offset'),
    bulkYOffsetValue: document.getElementById('bulk-y-offset-value'),
    bulkApplyXOffset: document.getElementById('bulk-apply-x-offset'),
    bulkXOffset: document.getElementById('bulk-x-offset'),
    bulkXOffsetValue: document.getElementById('bulk-x-offset-value'),
    bulkApplyBold: document.getElementById('bulk-apply-bold'),
    bulkBold: document.getElementById('bulk-bold'),
    bulkApplyCapitalize: document.getElementById('bulk-apply-capitalize'),
    bulkCapitalize: document.getElementById('bulk-capitalize'),
    bulkApplyAlign: document.getElementById('bulk-apply-align'),
    bulkAlign: document.getElementById('bulk-align'),
    bulkApply: document.getElementById('bulk-apply'),
    bulkCancel: document.getElementById('bulk-cancel'),
    bulkModalClose: document.querySelector('.bulk-modal-close'),
    finalActiveZonesList: document.getElementById('final-active-zones-list'),
    
    // Unsaved changes modal
    unsavedChangesModal: document.getElementById('unsaved-changes-modal'),
    unsavedSaveBtn: document.getElementById('unsaved-save-btn'),
    unsavedDiscardBtn: document.getElementById('unsaved-discard-btn'),
    
    // Review summaries
    canvasSummary: document.getElementById('canvas-summary'),
    gridSummary: document.getElementById('grid-summary'),
    zonesSummary: document.getElementById('zones-summary')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateActiveZonesList();
    updateFinalActiveZonesList();
    updateZoneGridAspectRatio();
    updateCanvasPreview();
    updateNavigationButtons();
    initializeAllSliders();
    
    // No default mask - user must select one
});

// Initialize all range sliders with dynamic progress
function initializeAllSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        // Set initial progress
        updateSliderProgress(slider);
        
        // Update progress on input (if not already handled)
        if (!slider.hasAttribute('data-progress-initialized')) {
            slider.addEventListener('input', () => updateSliderProgress(slider));
            slider.setAttribute('data-progress-initialized', 'true');
        }
    });
}

// Wizard Navigation
async function goToStep(stepNumber) {
    if (stepNumber < 0 || stepNumber > state.totalSteps) return;
    
    // Check for unsaved changes when leaving step 2
    if (state.currentStep === 2 && stepNumber !== 2 && state.maskEditor.hasUnsavedChanges) {
        // Show custom modal and wait for user decision
        return showUnsavedChangesModal(stepNumber);
    }
    
    // No unsaved changes, navigate normally
    performStepNavigation(stepNumber);
}

function showUnsavedChangesModal(targetStep) {
    // Show the modal
    elements.unsavedChangesModal.classList.add('active');
    
    // Store the target step for later
    state.pendingNavigationStep = targetStep;
    
    // Return to prevent navigation until user decides
    return;
}

async function continueNavigation(saveChanges) {
    // Hide modal
    elements.unsavedChangesModal.classList.remove('active');
    
    const targetStep = state.pendingNavigationStep;
    
    if (saveChanges) {
        // Save changes
        await saveEditedMaskToServer();
    }
    
    // Mark as no longer having unsaved changes
    state.maskEditor.hasUnsavedChanges = false;
    
    // Clear pending step
    state.pendingNavigationStep = null;
    
    // Now actually navigate
    performStepNavigation(targetStep);
}

function performStepNavigation(stepNumber) {
    if (stepNumber < 0 || stepNumber > state.totalSteps) return;
    
    // Update state
    const previousStep = state.currentStep;
    state.currentStep = stepNumber;
    
    // Mark previous steps as completed
    if (stepNumber > previousStep && !state.completedSteps.includes(previousStep)) {
        state.completedSteps.push(previousStep);
    }
    
    // Initialize mask editor if entering step 2
    if (stepNumber === 2) {
        initializeMaskEditor();
    }
    
    // Initialize grid settings sliders if entering step 3
    if (stepNumber === 3) {
        updateSliderProgress(elements.fontSize);
        updateSliderProgress(elements.horizontalSpacing);
        updateSliderProgress(elements.verticalSpacing);
        generateGridPreview();
    }
    
    // Set preview mode based on dimensions if entering step 5 (Final Review)
    if (stepNumber === 5) {
        setPreviewModeBasedOnDimensions();
        updateSliderProgress(elements.clipThreshold);
    }
    
    // Update wizard steps visibility
    elements.wizardSteps.forEach((step, index) => {
        if (index === stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update progress indicator
    elements.progressSteps.forEach((step, index) => {
        const stepNum = index;
        if (stepNum === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else if (state.completedSteps.includes(stepNum)) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Update progress connectors
    document.querySelectorAll('.progress-connector').forEach((connector, index) => {
        if (state.completedSteps.includes(index)) {
            connector.classList.add('completed');
        } else {
            connector.classList.remove('completed');
        }
    });
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update step 4 zone preview if navigating there
    if (stepNumber === 4) {
        renderZonePreview();
    }
    
    // Update step 5 review if navigating there
    if (stepNumber === 5) {
        updateReviewSummaries();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavigationButtons() {
    const wizardNav = document.querySelector('.wizard-navigation');
    
    // Hide navigation buttons on step 0 (About page has its own CTA)
    if (state.currentStep === 0) {
        if (wizardNav) wizardNav.style.display = 'none';
        return;
    } else {
        if (wizardNav) wizardNav.style.display = 'flex';
    }
    
    // Previous button
    elements.prevBtn.disabled = state.currentStep === 0;
    
    // Next button
    if (state.currentStep === state.totalSteps) {
        elements.nextBtn.style.display = 'none';
    } else {
        elements.nextBtn.style.display = 'inline-block';
        elements.nextBtn.textContent = 'Next →';
    }
}

function initializeEventListeners() {
    // Wizard navigation
    elements.prevBtn.addEventListener('click', () => goToStep(state.currentStep - 1));
    elements.nextBtn.addEventListener('click', () => goToStep(state.currentStep + 1));
    
    // Preset size selector
    elements.presetSize.addEventListener('change', (e) => {
        const preset = e.target.value;
        if (preset !== 'custom') {
            const [width, height] = preset.split('x').map(Number);
            elements.canvasWidth.value = width;
            elements.canvasHeight.value = height;
            
            // Update ratio display immediately
            const aspectRatio = width / height;
            const formatRatio = (num) => {
                const rounded = Math.round(num * 100) / 100;
                return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
            };
            const ratioDisplay = aspectRatio >= 1 
                ? `${formatRatio(aspectRatio)}:1` 
                : `1:${formatRatio(1/aspectRatio)}`;
            elements.canvasRatioDisplay.textContent = `${ratioDisplay} ratio`;
            
            updateCanvasPreview();
            updateZoneGridAspectRatio();
        }
    });
    
    // Custom dimensions
    elements.canvasWidth.addEventListener('change', () => {
        elements.presetSize.value = 'custom';
        updateCanvasPreview();
        updateZoneGridAspectRatio();
    });
    elements.canvasHeight.addEventListener('change', () => {
        elements.presetSize.value = 'custom';
        updateCanvasPreview();
        updateZoneGridAspectRatio();
    });
    
    // Mask mode selector
    const modeDefaultBtn = document.getElementById('mode-default');
    const modeCustomBtn = document.getElementById('mode-custom');
    const defaultMasksRow = document.getElementById('default-masks-row');
    const customUploadSection = document.querySelector('.custom-upload-section');
    
    modeDefaultBtn.addEventListener('click', () => {
        modeDefaultBtn.classList.add('active');
        modeCustomBtn.classList.remove('active');
        defaultMasksRow.style.display = 'flex';
        customUploadSection.style.display = 'none';
    });
    
    modeCustomBtn.addEventListener('click', () => {
        modeCustomBtn.classList.add('active');
        modeDefaultBtn.classList.remove('active');
        defaultMasksRow.style.display = 'none';
        customUploadSection.style.display = 'flex';
        // Automatically select the custom mask option and trigger upload
        document.getElementById('mask-custom').checked = true;
        elements.maskUpload.click();
    });
    
    // Mask selection - Load preset masks into editor
    elements.maskArrow.addEventListener('change', () => {
        if (elements.maskArrow.checked) {
            loadPresetMaskIntoEditor('arrow', '/api/mask/arrow');
        }
    });
    
    elements.maskSkyline.addEventListener('change', () => {
        if (elements.maskSkyline.checked) {
            loadPresetMaskIntoEditor('skyline', '/api/mask/skyline');
        }
    });
    
    elements.maskBorder.addEventListener('change', () => {
        if (elements.maskBorder.checked) {
            loadPresetMaskIntoEditor('border', '/api/mask/border');
        }
    });
    
    elements.maskNomask.addEventListener('change', () => {
        if (elements.maskNomask.checked) {
            loadPresetMaskIntoEditor('nomask', '/api/mask/nomask');
        }
    });
    
    elements.maskTriangles.addEventListener('change', () => {
        if (elements.maskTriangles.checked) {
            loadPresetMaskIntoEditor('triangles', '/api/mask/triangles');
        }
    });
    
    elements.maskCustom.addEventListener('change', () => {
        if (elements.maskCustom.checked) {
            state.maskType = 'custom';
            // Trigger file upload
            elements.maskUpload.click();
        }
    });
    
    elements.maskUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadMask(file);
        } else {
            // If user cancelled, uncheck the custom radio
            elements.maskCustom.checked = false;
        }
    });
    
    // Mask Editor - Threshold slider
    elements.thresholdSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        state.maskEditor.threshold = value;
        elements.thresholdValue.textContent = value;
        updateSliderProgress(e.target);
        applyThreshold();
        state.maskEditor.hasUnsavedChanges = true;
    });
    
    // Mask Editor - Invert mask checkbox
    elements.invertMask.addEventListener('change', (e) => {
        state.maskEditor.invert = e.target.checked;
        applyThreshold();  // Re-apply threshold with new invert setting
        state.maskEditor.hasUnsavedChanges = true;
    });
    
    // Mask Editor - Fit buttons
    elements.fitContain.addEventListener('click', () => {
        setFitMode('contain');
    });
    elements.fitCover.addEventListener('click', () => {
        setFitMode('cover');
    });
    elements.fitStretch.addEventListener('click', () => {
        setFitMode('stretch');
    });
    
    // Mask Editor - Brush controls
    elements.brushWhite.addEventListener('change', () => {
        state.maskEditor.brushColor = 'white';
        updateBrushCursor();
    });
    elements.brushBlack.addEventListener('change', () => {
        state.maskEditor.brushColor = 'black';
        updateBrushCursor();
    });
    elements.brushSize.addEventListener('input', (e) => {
        state.maskEditor.brushSize = parseInt(e.target.value);
        elements.brushSizeValue.textContent = e.target.value;
        updateSliderProgress(e.target);
        updateBrushCursor();
    });
    
    // Mask Editor - Action buttons
    elements.clearBrush.addEventListener('click', clearBrushEdits);
    elements.resetMask.addEventListener('click', resetMaskToOriginal);
    elements.applyMaskChanges.addEventListener('click', async () => {
        await saveEditedMaskToServer();
        state.maskEditor.hasUnsavedChanges = false;
        goToStep(3);  // Move to Grid Settings
    });
    
    // Grid settings - Range slider updates
    elements.fontSize.addEventListener('input', (e) => {
        elements.fontSizeValue.textContent = e.target.value;
        updateSliderProgress(e.target);
    });
    
    elements.horizontalSpacing.addEventListener('input', (e) => {
        elements.hSpacingValue.textContent = e.target.value;
        updateSliderProgress(e.target);
    });
    
    elements.verticalSpacing.addEventListener('input', (e) => {
        elements.vSpacingValue.textContent = e.target.value;
        updateSliderProgress(e.target);
    });
    
    elements.clipThreshold.addEventListener('input', (e) => {
        elements.clipThresholdValue.textContent = parseFloat(e.target.value).toFixed(2);
        updateSliderProgress(e.target);
    });
    
    // Grid font color picker
    elements.gridFontColor.addEventListener('input', (e) => {
        const colorLabel = e.target.parentElement.querySelector('.color-label');
        if (colorLabel) {
            const color = e.target.value.toUpperCase();
            const colorName = color === '#000000' ? 'Black' : 
                              color === '#FFFFFF' ? 'White' : 
                              color === '#FF0000' ? 'Red' :
                              color === '#00FF00' ? 'Green' :
                              color === '#0000FF' ? 'Blue' : 
                              color === '#FFFF00' ? 'Yellow' :
                              color === '#00FFFF' ? 'Cyan' :
                              color === '#FF00FF' ? 'Magenta' : 'Custom';
            colorLabel.textContent = `${colorName} (${color})`;
        }
    });
    
    // Grid Background Color picker
    elements.gridBackgroundColor.addEventListener('input', (e) => {
        const bgColorLabel = document.getElementById('bg-color-label');
        if (bgColorLabel) {
            const color = e.target.value.toUpperCase();
            const colorName = color === '#000000' ? 'Black' : 
                              color === '#FFFFFF' ? 'White' : 
                              color === '#FF0000' ? 'Red' :
                              color === '#00FF00' ? 'Green' :
                              color === '#0000FF' ? 'Blue' : 
                              color === '#FFFF00' ? 'Yellow' :
                              color === '#00FFFF' ? 'Cyan' :
                              color === '#FF00FF' ? 'Magenta' : 'Custom';
            bgColorLabel.textContent = `${colorName} (${color})`;
        }
        
        // Update preview backgrounds immediately
        elements.gridPreviewContainer.style.backgroundColor = e.target.value;
        const zoneLayoutVisual = document.getElementById('zone-layout-visual');
        if (zoneLayoutVisual) {
            zoneLayoutVisual.style.backgroundColor = e.target.value;
        }
        
        // Re-render zone preview if on that step
        if (state.currentStep === 4) {
            renderZonePreview();
        }
        
        // Update modal preview if it's open
        if (state.currentEditingZone) {
            updateZoneLivePreview();
        }
    });
    
    // Grid preview button
    elements.previewGridBtn.addEventListener('click', generateGridPreview);
    
    // Collapsible sections
    document.querySelectorAll('.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });
    
    // Zone cells
    elements.zoneCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const zoneName = cell.dataset.zone;
            openZoneEditor(zoneName);
        });
    });
    
    // Modal controls
    elements.modalClose.addEventListener('click', closeZoneEditor);
    elements.zoneModal.addEventListener('click', (e) => {
        if (e.target === elements.zoneModal) {
            closeZoneEditor();
        }
    });
    
    elements.zoneSave.addEventListener('click', saveZoneText);
    elements.zoneDelete.addEventListener('click', deleteZoneText);
    
    // Live preview updates for zone editor
    elements.zoneText.addEventListener('input', () => {
        updateAlignmentDropdownState();
        updateZoneLivePreview();
    });
    elements.zoneFontSize.addEventListener('input', updateZoneLivePreview);
    elements.zoneColor.addEventListener('input', updateZoneLivePreview);
    elements.zoneBold.addEventListener('change', updateZoneLivePreview);
    elements.zoneCapitalize.addEventListener('change', updateZoneLivePreview);
    
    // Segmented alignment control
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                // Remove active class from all buttons
                document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Update hidden input value
                elements.zoneAlign.value = this.dataset.value;
                // Update preview
                updateZoneLivePreview();
            }
        });
    });
    
    // Y-offset slider
    elements.zoneYOffset.addEventListener('input', (e) => {
        // Invert the value for display (slider is reversed for UX)
        elements.zoneYOffsetValue.textContent = -parseInt(e.target.value);
        updateSliderProgress(e.target);
        updateZoneLivePreview();
    });
    
    // X-offset slider
    elements.zoneXOffset.addEventListener('input', (e) => {
        elements.zoneXOffsetValue.textContent = e.target.value;
        updateSliderProgress(e.target);
        updateZoneLivePreview();
    });
    
    // Bulk zone editor
    elements.bulkApply.addEventListener('click', applyBulkSettings);
    elements.bulkCancel.addEventListener('click', closeBulkZoneEditor);
    elements.bulkModalClose.addEventListener('click', closeBulkZoneEditor);
    
    // Enable/disable inputs based on checkboxes
    elements.bulkApplyFontSize.addEventListener('change', (e) => {
        elements.bulkFontSize.disabled = !e.target.checked;
    });
    elements.bulkApplyColor.addEventListener('change', (e) => {
        elements.bulkColor.disabled = !e.target.checked;
    });
    elements.bulkApplyYOffset.addEventListener('change', (e) => {
        elements.bulkYOffset.disabled = !e.target.checked;
    });
    elements.bulkApplyXOffset.addEventListener('change', (e) => {
        elements.bulkXOffset.disabled = !e.target.checked;
    });
    elements.bulkApplyBold.addEventListener('change', (e) => {
        elements.bulkBold.disabled = !e.target.checked;
    });
    elements.bulkApplyCapitalize.addEventListener('change', (e) => {
        elements.bulkCapitalize.disabled = !e.target.checked;
    });
    elements.bulkApplyAlign.addEventListener('change', (e) => {
        elements.bulkAlign.disabled = !e.target.checked;
    });
    
    // Bulk Y-offset slider
    elements.bulkYOffset.addEventListener('input', (e) => {
        elements.bulkYOffsetValue.textContent = e.target.value;
    });
    
    // Bulk X-offset slider
    elements.bulkXOffset.addEventListener('input', (e) => {
        elements.bulkXOffsetValue.textContent = e.target.value;
    });
    
    // Close bulk modal on background click
    elements.bulkZoneModal.addEventListener('click', (e) => {
        if (e.target === elements.bulkZoneModal) {
            closeBulkZoneEditor();
        }
    });
    
    // Unsaved changes modal buttons
    elements.unsavedSaveBtn.addEventListener('click', () => continueNavigation(true));
    elements.unsavedDiscardBtn.addEventListener('click', () => continueNavigation(false));
    
    // Render button
    elements.renderBtn.addEventListener('click', renderBanner);
    
    // Preview mode toggle
    elements.previewLinkedin.addEventListener('change', () => {
        if (elements.previewLinkedin.checked) {
            updatePreviewMode('linkedin');
        }
    });
    elements.previewBasic.addEventListener('change', () => {
        if (elements.previewBasic.checked) {
            updatePreviewMode('basic');
        }
    });
    
    // Download button
    elements.downloadBtn.addEventListener('click', downloadBanner);
}

// Canvas Preview (Step 1)
function updateCanvasPreview() {
    const width = parseInt(elements.canvasWidth.value) || 1584;
    const height = parseInt(elements.canvasHeight.value) || 396;
    const aspectRatio = width / height;
    
    // Update canvas shape
    if (elements.canvasShapePreview) {
        elements.canvasShapePreview.style.aspectRatio = `${width} / ${height}`;
        
        if (elements.canvasDimensionsDisplay) {
            elements.canvasDimensionsDisplay.textContent = `${width} × ${height}`;
        }
        
        const formatRatio = (num) => {
            const rounded = Math.round(num * 100) / 100;
            return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
        };
        
        const ratioDisplay = aspectRatio >= 1 
            ? `${formatRatio(aspectRatio)}:1` 
            : `1:${formatRatio(1/aspectRatio)}`;
        
        if (elements.canvasRatioDisplay) {
            elements.canvasRatioDisplay.textContent = `${ratioDisplay} ratio`;
        }
    }
    
    // Update layout based on aspect ratio
    // updateLayoutForAspectRatio(aspectRatio); // Disabled - user no longer wants vertical layout
    
    // Remove any existing vertical layout classes
    const steps = [1, 2, 3];
    steps.forEach(stepNum => {
        const stepElement = document.querySelector(`#step-${stepNum} .step-content`);
        if (stepElement) {
            stepElement.classList.remove('vertical-layout');
        }
    });
}

// Update layout for wide aspect ratios
function updateLayoutForAspectRatio(aspectRatio) {
    // Use vertical layout for wide aspect ratios (>= 3:1)
    const useVerticalLayout = aspectRatio >= 3;
    
    // Update steps 1, 2, and 3
    const steps = [1, 2, 3];
    steps.forEach(stepNum => {
        const stepElement = document.querySelector(`#step-${stepNum} .step-content`);
        if (stepElement) {
            if (useVerticalLayout) {
                stepElement.classList.add('vertical-layout');
            } else {
                stepElement.classList.remove('vertical-layout');
            }
        }
    });
}

// Update canvas mask image
function updateCanvasMaskImage(imageSrc) {
    if (elements.canvasMaskImage) {
        elements.canvasMaskImage.src = imageSrc;
        elements.canvasMaskImage.style.display = 'block';
    }
    // Hide placeholder when mask is loaded
    if (elements.canvasPlaceholder) {
        elements.canvasPlaceholder.style.display = 'none';
    }
}

// Grid Preview (Step 2) - NEW FEATURE
async function generateGridPreview() {
    elements.gridLoading.style.display = 'flex';
    elements.gridPreviewContainer.innerHTML = '';
    
    const params = {
        canvas_width: parseInt(elements.canvasWidth.value),
        canvas_height: parseInt(elements.canvasHeight.value),
        font_size: parseInt(elements.fontSize.value),
        horizontal_spacing: parseInt(elements.horizontalSpacing.value),
        vertical_spacing: parseInt(elements.verticalSpacing.value),
        font_family: elements.fontFamily.value,
        bold_digits: elements.boldDigits.checked,
        font_color: elements.gridFontColor.value,
        background_color: elements.gridBackgroundColor.value
    };
    
    try {
        const response = await fetch('/api/preview_grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        const data = await response.json();
        
        if (data.success) {
            elements.gridPreviewContainer.innerHTML = `<img src="${data.preview}" alt="Grid preview">`;
            showNotification('Grid preview generated!', 'success');
        } else {
            elements.gridPreviewContainer.innerHTML = `<p class="empty-state" style="color: red;">${data.error || 'Failed to generate preview'}</p>`;
            showNotification(data.error || 'Preview failed', 'error');
        }
    } catch (error) {
        console.error('Preview error:', error);
        elements.gridPreviewContainer.innerHTML = '<p class="empty-state" style="color: red;">Failed to generate preview</p>';
        showNotification('Failed to generate preview', 'error');
    } finally {
        elements.gridLoading.style.display = 'none';
    }
}

// Update Review Summaries (Step 4)
function updateReviewSummaries() {
    // Canvas summary
    const width = parseInt(elements.canvasWidth.value);
    const height = parseInt(elements.canvasHeight.value);
    let maskName = 'None selected';
    if (state.maskType === 'arrow') maskName = 'Arrow';
    else if (state.maskType === 'skyline') maskName = 'Skyline (Boston)';
    else if (state.maskType === 'border') maskName = 'Binary Border';
    else if (state.maskType === 'nomask') maskName = 'Binary Fill (No Mask)';
    else if (state.maskType === 'triangles') maskName = 'Repeating Large Triangles';
    else if (state.maskType === 'custom') maskName = state.maskFilename || 'Custom';
    
    elements.canvasSummary.innerHTML = `
        <p><strong>Dimensions:</strong> ${width} × ${height}px</p>
        <p><strong>Mask:</strong> ${maskName}</p>
        <p><strong>Fit Mode:</strong> ${state.maskEditor.fitMode}</p>
    `;
    
    // Grid summary
    elements.gridSummary.innerHTML = `
        <p><strong>Font:</strong> ${elements.fontFamily.value}</p>
        <p><strong>Size:</strong> ${elements.fontSize.value}px</p>
        <p><strong>Font Color:</strong> ${elements.gridFontColor.value.toUpperCase()}</p>
        <p><strong>Background Color:</strong> ${elements.gridBackgroundColor.value.toUpperCase()}</p>
        <p><strong>Spacing:</strong> H:${elements.horizontalSpacing.value}px V:${elements.verticalSpacing.value}px</p>
        <p><strong>Bold:</strong> ${elements.boldDigits.checked ? 'Yes' : 'No'}</p>
    `;
    
    // Zones summary
    const zoneCount = Object.keys(state.textZones).length;
    if (zoneCount === 0) {
        elements.zonesSummary.innerHTML = '<p>No text zones added</p>';
    } else {
        const zonesList = Object.values(state.textZones).map(z => {
            const zoneName = z.zone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const preview = z.text.substring(0, 20) + (z.text.length > 20 ? '...' : '');
            return `<p><strong>${zoneName}:</strong> "${preview}"</p>`;
        }).join('');
        elements.zonesSummary.innerHTML = zonesList;
    }
}

// [Remaining functions from original app.js - mask upload, zone editing, rendering, etc.]

function loadPresetMaskIntoEditor(maskType, maskUrl) {
    state.maskType = maskType;
    state.maskFilename = maskType;
    elements.maskPreview.innerHTML = '';
    
    // Update canvas preview
    updateCanvasMaskImage(maskUrl);
    
    // Load image into mask editor (but don't auto-navigate)
    const img = new Image();
    img.onload = () => {
        state.maskEditor.originalImage = img;
        state.maskEditor.currentImage = img;
        state.maskEditor.hasUnsavedChanges = false;  // Reset unsaved changes
        
        // Reset threshold to default
        state.maskEditor.threshold = 128;
        elements.thresholdSlider.value = 128;
        elements.thresholdValue.textContent = '128';
        
        showNotification('Mask loaded successfully!', 'success');
    };
    img.src = maskUrl;
}

async function uploadMask(file) {
    const formData = new FormData();
    formData.append('mask', file);
    
    try {
        const response = await fetch('/api/upload_mask', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            state.maskFilename = data.filename;
            elements.maskPreview.innerHTML = `<img src="${data.preview}" alt="Mask preview">`;
            
            // Update canvas preview with uploaded mask
            updateCanvasMaskImage(data.preview);
            
            // Update canvas dimensions to match uploaded image
            if (data.width && data.height) {
                elements.presetSize.value = 'custom';
                elements.canvasWidth.value = data.width;
                elements.canvasHeight.value = data.height;
                updateCanvasPreview();
                updateZoneGridAspectRatio();
                showNotification(`Mask uploaded! Canvas set to ${data.width}x${data.height}`, 'success');
            } else {
                showNotification('Mask uploaded successfully!', 'success');
            }
            
            // Load image into mask editor (but don't auto-navigate)
            const img = new Image();
            img.onload = () => {
                state.maskEditor.originalImage = img;
                state.maskEditor.currentImage = img;
                state.maskEditor.hasUnsavedChanges = false;  // Reset unsaved changes
                
                // Reset threshold to default
                state.maskEditor.threshold = 128;
                elements.thresholdSlider.value = 128;
                elements.thresholdValue.textContent = '128';
            };
            img.src = data.preview;
            
        } else {
            showNotification(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Failed to upload mask', 'error');
    }
}

function openZoneEditor(zoneName) {
    state.currentEditingZone = zoneName;
    
    const displayName = zoneName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    elements.modalZoneName.textContent = displayName;
    
    if (state.textZones[zoneName]) {
        const zone = state.textZones[zoneName];
        elements.zoneText.value = zone.text;
        elements.zoneFontSize.value = zone.font_size;
        elements.zoneColor.value = zone.color;
        // Invert y_offset for slider (slider is reversed for UX)
        elements.zoneYOffset.value = -(zone.y_offset || 0);
        elements.zoneYOffsetValue.textContent = zone.y_offset || 0;
        elements.zoneXOffset.value = zone.x_offset || 0;
        elements.zoneXOffsetValue.textContent = zone.x_offset || 0;
        elements.zoneBold.checked = zone.bold;
        elements.zoneCapitalize.checked = zone.capitalize || false;
        elements.zoneAlign.value = zone.align;
        
        // Update segmented control active state
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === zone.align);
        });
    } else {
        elements.zoneText.value = '';
        // Use current grid font size as default for new zones
        elements.zoneFontSize.value = parseInt(elements.fontSize.value) || 10;
        elements.zoneColor.value = '#00c853';
        elements.zoneYOffset.value = 0;
        elements.zoneYOffsetValue.textContent = 0;
        elements.zoneXOffset.value = 0;
        elements.zoneXOffsetValue.textContent = 0;
        elements.zoneBold.checked = false;
        elements.zoneCapitalize.checked = false;
        elements.zoneAlign.value = 'center';
        
        // Update segmented control active state (default to center)
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === 'center');
        });
    }
    
    elements.zoneModal.classList.add('active');
    
    // Update alignment dropdown state
    updateAlignmentDropdownState();
    
    // Initialize slider progress bars
    updateSliderProgress(elements.zoneYOffset);
    updateSliderProgress(elements.zoneXOffset);
    
    // Initial preview render
    updateZoneLivePreview();
}

function closeZoneEditor() {
    elements.zoneModal.classList.remove('active');
    state.currentEditingZone = null;
}

function updateSliderProgress(slider) {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Update background gradient for WebKit browsers
    slider.style.background = `linear-gradient(to right, #68C7EC 0%, #68C7EC ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
}

function updateAlignmentDropdownState() {
    const text = elements.zoneText.value;
    const lines = text.split('\n');
    const hasMultipleLines = lines.length > 1;
    
    const alignLabel = document.getElementById('zone-align-label');
    const alignWrapper = document.getElementById('zone-align-wrapper');
    const segmentButtons = document.querySelectorAll('.segment-btn');
    
    if (hasMultipleLines) {
        alignLabel.classList.remove('disabled');
        alignLabel.removeAttribute('title');
        alignWrapper.removeAttribute('title');
        segmentButtons.forEach(btn => {
            btn.disabled = false;
        });
    } else {
        alignLabel.classList.add('disabled');
        alignLabel.setAttribute('title', 'Requires multiple lines');
        alignWrapper.setAttribute('title', 'Requires multiple lines');
        segmentButtons.forEach(btn => {
            btn.disabled = true;
        });
    }
}

function updateZoneLivePreview() {
    const canvas = elements.zoneLivePreview;
    if (!canvas || !state.currentEditingZone) return;
    
    // Get current input values
    const text = elements.zoneText.value;
    
    if (!text.trim()) {
        // Show placeholder
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 150;
        ctx.fillStyle = elements.gridBackgroundColor.value || '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Enter text to see preview', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const fontSize = parseInt(elements.zoneFontSize.value) || 18;
    const color = elements.zoneColor.value;
    const bold = elements.zoneBold.checked;
    const capitalize = elements.zoneCapitalize.checked;
    const align = elements.zoneAlign.value;
    const xOffset = parseInt(elements.zoneXOffset.value) || 0;
    // Invert y_offset from slider (slider is reversed for UX)
    const yOffset = -(parseInt(elements.zoneYOffset.value) || 0);
    
    // Get actual canvas dimensions
    const actualCanvasWidth = parseInt(elements.canvasWidth.value) || 1584;
    const actualCanvasHeight = parseInt(elements.canvasHeight.value) || 396;
    
    // Apply capitalization
    let displayText = text;
    if (capitalize) {
        displayText = displayText.toUpperCase();
    }
    
    const lines = displayText.split('\n');
    const fontWeight = bold ? 'bold' : 'normal';
    const fontFamily = 'Courier, monospace';
    
    // Measure text at actual size
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    const lineWidths = lines.map(line => tempCtx.measureText(line).width);
    const textWidth = Math.max(...lineWidths, 0);
    const internalLineSpacing = fontSize * 0.8;
    const textHeight = lines.length * fontSize + (internalLineSpacing * Math.max(0, lines.length - 1));
    
    // Calculate text position on actual canvas
    const basePos = getZonePosition(state.currentEditingZone, actualCanvasWidth, actualCanvasHeight, textWidth, textHeight);
    const textX = basePos.x + xOffset;
    const textY = basePos.y + yOffset;
    
    // Define the view window (zoomed to zone area with padding)
    const padding = 80;
    
    // Start with text-centered view
    let viewCenterX = textX + textWidth / 2;
    let viewCenterY = textY + textHeight / 2;
    let viewWidth = Math.max(300, textWidth + padding * 2);
    let viewHeight = Math.max(150, textHeight + padding * 2);
    
    // Calculate initial view bounds
    let viewLeft = viewCenterX - viewWidth / 2;
    let viewTop = viewCenterY - viewHeight / 2;
    let viewRight = viewLeft + viewWidth;
    let viewBottom = viewTop + viewHeight;
    
    // Adjust view to favor in-bounds area (canvas boundaries are 0 to actualCanvasWidth/Height)
    // If view extends beyond canvas, shift it to show more in-bounds area
    if (viewLeft < 0) {
        const shift = Math.min(-viewLeft, viewWidth * 0.3); // Shift right, but not too much
        viewLeft += shift;
        viewRight += shift;
    }
    if (viewRight > actualCanvasWidth) {
        const shift = Math.min(viewRight - actualCanvasWidth, viewWidth * 0.3); // Shift left
        viewLeft -= shift;
        viewRight -= shift;
    }
    if (viewTop < 0) {
        const shift = Math.min(-viewTop, viewHeight * 0.3); // Shift down
        viewTop += shift;
        viewBottom += shift;
    }
    if (viewBottom > actualCanvasHeight) {
        const shift = Math.min(viewBottom - actualCanvasHeight, viewHeight * 0.3); // Shift up
        viewTop -= shift;
        viewBottom -= shift;
    }
    
    // Update view dimensions
    viewWidth = viewRight - viewLeft;
    viewHeight = viewBottom - viewTop;
    
    // Set canvas size (scale to fit in modal)
    const maxWidth = 700;
    const scale = Math.min(1, maxWidth / viewWidth);
    canvas.width = viewWidth * scale;
    canvas.height = viewHeight * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Clear with user-selected background color
    ctx.fillStyle = elements.gridBackgroundColor.value || '#000000';
    ctx.fillRect(0, 0, viewWidth, viewHeight);
    
    // Draw red canvas boundary lines where they intersect the view
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Top edge
    if (viewTop <= 0 && viewBottom >= 0) {
        ctx.moveTo(Math.max(0, -viewLeft), -viewTop);
        ctx.lineTo(Math.min(viewWidth, actualCanvasWidth - viewLeft), -viewTop);
    }
    // Bottom edge
    if (viewTop <= actualCanvasHeight && viewBottom >= actualCanvasHeight) {
        ctx.moveTo(Math.max(0, -viewLeft), actualCanvasHeight - viewTop);
        ctx.lineTo(Math.min(viewWidth, actualCanvasWidth - viewLeft), actualCanvasHeight - viewTop);
    }
    // Left edge
    if (viewLeft <= 0 && viewRight >= 0) {
        ctx.moveTo(-viewLeft, Math.max(0, -viewTop));
        ctx.lineTo(-viewLeft, Math.min(viewHeight, actualCanvasHeight - viewTop));
    }
    // Right edge
    if (viewLeft <= actualCanvasWidth && viewRight >= actualCanvasWidth) {
        ctx.moveTo(actualCanvasWidth - viewLeft, Math.max(0, -viewTop));
        ctx.lineTo(actualCanvasWidth - viewLeft, Math.min(viewHeight, actualCanvasHeight - viewTop));
    }
    
    ctx.stroke();
    
    // Set text properties
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    
    // Render text (offset by view position)
    let currentY = textY - viewTop;
    lines.forEach((line, index) => {
        const lineWidth = lineWidths[index];
        let lineX;
        
        if (align === 'left') {
            lineX = textX - viewLeft;
        } else if (align === 'right') {
            lineX = (textX + textWidth - lineWidth) - viewLeft;
        } else { // center
            lineX = (textX + (textWidth - lineWidth) / 2) - viewLeft;
        }
        
        ctx.fillText(line, lineX, currentY);
        currentY += fontSize + (index < lines.length - 1 ? internalLineSpacing : 0);
    });
    
    // Draw crosshair at text center
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    const textCenterX = (textX + textWidth / 2) - viewLeft;
    const textCenterY = (textY + textHeight / 2) - viewTop;
    
    ctx.beginPath();
    ctx.moveTo(0, textCenterY);
    ctx.lineTo(viewWidth, textCenterY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(textCenterX, 0);
    ctx.lineTo(textCenterX, viewHeight);
    ctx.stroke();
    
    ctx.setLineDash([]);
}

function saveZoneText() {
    const zoneName = state.currentEditingZone;
    const text = elements.zoneText.value.trim();
    
    if (text) {
        state.textZones[zoneName] = {
            zone: zoneName,
            text: text,
            font_size: parseInt(elements.zoneFontSize.value),
            color: elements.zoneColor.value,
            // Invert y_offset from slider (slider is reversed for UX)
            y_offset: -parseInt(elements.zoneYOffset.value),
            x_offset: parseInt(elements.zoneXOffset.value),
            bold: elements.zoneBold.checked,
            capitalize: elements.zoneCapitalize.checked,
            align: elements.zoneAlign.value
        };
    } else {
        delete state.textZones[zoneName];
    }
    
    updateActiveZonesList();
    updateFinalActiveZonesList();
    updateZoneCellsUI();
    renderZonePreview();
    closeZoneEditor();
    showNotification('Text zone saved!', 'success');
}

function deleteZoneText() {
    const zoneName = state.currentEditingZone;
    delete state.textZones[zoneName];
    
    updateActiveZonesList();
    updateFinalActiveZonesList();
    updateZoneCellsUI();
    renderZonePreview();
    closeZoneEditor();
    showNotification('Text zone removed', 'info');
}

function updateActiveZonesList() {
    const zones = Object.values(state.textZones);
    
    if (zones.length === 0) {
        elements.activeZonesList.innerHTML = '<p class="empty-state">No text zones added yet. Click a zone above to get started.</p>';
        return;
    }
    
    elements.activeZonesList.innerHTML = zones.map(zone => {
        const displayName = zone.zone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const preview = zone.text.substring(0, 50) + (zone.text.length > 50 ? '...' : '');
        
        return `
            <div class="zone-item" onclick="openZoneEditor('${zone.zone}')">
                <div class="zone-item-header">
                    <span class="zone-item-name">${displayName}</span>
                    <span style="color: ${zone.color}; font-size: 0.9em;">●</span>
                </div>
                <div class="zone-item-preview">${preview}</div>
            </div>
        `;
    }).join('');
}

function updateFinalActiveZonesList() {
    const zones = Object.values(state.textZones);
    const modifyAllBtn = document.getElementById('modify-all-zones-btn');
    
    if (zones.length === 0) {
        elements.finalActiveZonesList.innerHTML = '<p class="empty-state">No text zones added yet.</p>';
        // Disable the modify all button when no zones exist
        if (modifyAllBtn) {
            modifyAllBtn.disabled = true;
            modifyAllBtn.style.opacity = '0.5';
            modifyAllBtn.style.cursor = 'not-allowed';
        }
        return;
    }
    
    // Enable the modify all button when zones exist
    if (modifyAllBtn) {
        modifyAllBtn.disabled = false;
        modifyAllBtn.style.opacity = '1';
        modifyAllBtn.style.cursor = 'pointer';
    }
    
    elements.finalActiveZonesList.innerHTML = zones.map(zone => {
        const displayName = zone.zone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const preview = zone.text.substring(0, 50) + (zone.text.length > 50 ? '...' : '');
        
        return `
            <div class="zone-item" onclick="openZoneEditor('${zone.zone}')">
                <div class="zone-item-header">
                    <span class="zone-item-name">${displayName}</span>
                    <span style="color: ${zone.color}; font-size: 0.9em;">●</span>
                </div>
                <div class="zone-item-preview">${preview}</div>
            </div>
        `;
    }).join('');
}

function openBulkZoneEditor() {
    // Don't open if no zones exist
    const zones = Object.values(state.textZones);
    if (zones.length === 0) {
        return;
    }
    
    // Reset all checkboxes and set default values
    elements.bulkApplyFontSize.checked = false;
    elements.bulkFontSize.value = 18;
    elements.bulkFontSize.disabled = true;
    
    elements.bulkApplyColor.checked = false;
    elements.bulkColor.value = '#00c853';
    elements.bulkColor.disabled = true;
    
    elements.bulkApplyYOffset.checked = false;
    elements.bulkYOffset.value = 0;
    elements.bulkYOffsetValue.textContent = 0;
    elements.bulkYOffset.disabled = true;
    
    elements.bulkApplyXOffset.checked = false;
    elements.bulkXOffset.value = 0;
    elements.bulkXOffsetValue.textContent = 0;
    elements.bulkXOffset.disabled = true;
    
    elements.bulkApplyBold.checked = false;
    elements.bulkBold.checked = false;
    elements.bulkBold.disabled = true;
    
    elements.bulkApplyCapitalize.checked = false;
    elements.bulkCapitalize.checked = false;
    elements.bulkCapitalize.disabled = true;
    
    elements.bulkApplyAlign.checked = false;
    elements.bulkAlign.value = 'center';
    elements.bulkAlign.disabled = true;
    
    elements.bulkZoneModal.classList.add('active');
}

function closeBulkZoneEditor() {
    elements.bulkZoneModal.classList.remove('active');
}

function applyBulkSettings() {
    const zones = Object.keys(state.textZones);
    
    if (zones.length === 0) {
        showNotification('No text zones to modify', 'error');
        return;
    }
    
    // Check if at least one setting is selected
    const hasSelection = elements.bulkApplyFontSize.checked ||
                        elements.bulkApplyColor.checked ||
                        elements.bulkApplyYOffset.checked ||
                        elements.bulkApplyXOffset.checked ||
                        elements.bulkApplyBold.checked ||
                        elements.bulkApplyCapitalize.checked ||
                        elements.bulkApplyAlign.checked;
    
    if (!hasSelection) {
        showNotification('Please select at least one setting to apply', 'error');
        return;
    }
    
    // Apply only selected settings to all zones
    zones.forEach(zoneName => {
        const zone = state.textZones[zoneName];
        
        if (elements.bulkApplyFontSize.checked) {
            zone.font_size = parseInt(elements.bulkFontSize.value);
        }
        if (elements.bulkApplyColor.checked) {
            zone.color = elements.bulkColor.value;
        }
        if (elements.bulkApplyYOffset.checked) {
            zone.y_offset = parseInt(elements.bulkYOffset.value);
        }
        if (elements.bulkApplyXOffset.checked) {
            zone.x_offset = parseInt(elements.bulkXOffset.value);
        }
        if (elements.bulkApplyBold.checked) {
            zone.bold = elements.bulkBold.checked;
        }
        if (elements.bulkApplyCapitalize.checked) {
            zone.capitalize = elements.bulkCapitalize.checked;
        }
        if (elements.bulkApplyAlign.checked) {
            zone.align = elements.bulkAlign.value;
        }
    });
    
    updateActiveZonesList();
    updateFinalActiveZonesList();
    updateZoneCellsUI();
    renderZonePreview();
    closeBulkZoneEditor();
    
    // Build a message showing what was applied
    const appliedSettings = [];
    if (elements.bulkApplyFontSize.checked) appliedSettings.push('font size');
    if (elements.bulkApplyColor.checked) appliedSettings.push('color');
    if (elements.bulkApplyYOffset.checked) appliedSettings.push('vertical offset');
    if (elements.bulkApplyXOffset.checked) appliedSettings.push('horizontal offset');
    if (elements.bulkApplyBold.checked) appliedSettings.push('bold');
    if (elements.bulkApplyCapitalize.checked) appliedSettings.push('capitalize');
    if (elements.bulkApplyAlign.checked) appliedSettings.push('alignment');
    
    showNotification(`Applied ${appliedSettings.join(', ')} to ${zones.length} zone(s)!`, 'success');
}

function updateZoneCellsUI() {
    elements.zoneCells.forEach(cell => {
        const zoneName = cell.dataset.zone;
        if (state.textZones[zoneName]) {
            cell.classList.add('has-text');
        } else {
            cell.classList.remove('has-text');
        }
    });
}

function getZonePosition(zoneName, canvasWidth, canvasHeight, textWidth, textHeight) {
    // Match the exact backend logic from banner_renderer.py
    const margin = 24;
    let x, y;
    
    // Vertical positioning
    if (zoneName.startsWith('top_')) {
        y = margin;
    } else if (zoneName.startsWith('middle_')) {
        y = (canvasHeight - textHeight) / 2;
    } else { // bottom_
        y = canvasHeight - margin - textHeight;
    }
    
    // Horizontal positioning
    if (zoneName.endsWith('_left')) {
        x = margin;
    } else if (zoneName.endsWith('_center')) {
        x = (canvasWidth - textWidth) / 2;
    } else { // _right
        x = canvasWidth - margin - textWidth;
    }
    
    return { x, y };
}

function renderZonePreview() {
    const canvas = elements.zonePreviewCanvas;
    if (!canvas) return;
    
    // Get canvas dimensions from user settings
    const canvasWidth = parseInt(elements.canvasWidth.value) || 1584;
    const canvasHeight = parseInt(elements.canvasHeight.value) || 396;
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with user-selected background color
    ctx.fillStyle = elements.gridBackgroundColor.value || '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render each text zone using exact backend positioning
    Object.values(state.textZones).forEach(zone => {
        // Apply capitalization if requested
        let displayText = zone.text;
        if (zone.capitalize) {
            displayText = displayText.toUpperCase();
        }
        
        const lines = displayText.split('\n');
        const fontSize = zone.font_size || 18;
        const fontWeight = zone.bold ? 'bold' : 'normal';
        const fontFamily = 'Courier, monospace'; // Match backend font
        
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        // Measure text dimensions
        const lineHeights = [];
        const lineWidths = [];
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            lineWidths.push(metrics.width);
            // Approximate line height (canvas doesn't give exact height)
            lineHeights.push(fontSize);
        });
        
        const textWidth = lineWidths.length > 0 ? Math.max(...lineWidths) : 0;
        const internalLineSpacing = fontSize * 0.8;
        const textHeight = lineHeights.reduce((sum, h) => sum + h, 0) + 
                          (internalLineSpacing * Math.max(0, lines.length - 1));
        
        // Skip if no text
        if (textWidth === 0 || textHeight === 0) return;
        
        // Get base position using exact backend logic
        const basePos = getZonePosition(zone.zone, canvasWidth, canvasHeight, textWidth, textHeight);
        
        // Apply user-defined offsets
        const xOffset = zone.x_offset || 0;
        const yOffset = zone.y_offset || 0;
        let baseX = basePos.x + xOffset;
        let baseY = basePos.y + yOffset;
        
        // Set text properties
        ctx.fillStyle = zone.color || '#00c853';
        ctx.textBaseline = 'top'; // Start from top for precise positioning
        
        // Render each line with proper alignment
        let currentY = baseY;
        lines.forEach((line, index) => {
            const lineWidth = lineWidths[index];
            const lineHeight = lineHeights[index];
            
            let lineX;
            const align = zone.align || 'left';
            
            // Apply horizontal alignment
            if (align === 'left') {
                lineX = baseX;
            } else if (align === 'right') {
                lineX = baseX + (textWidth - lineWidth);
            } else { // center
                lineX = baseX + (textWidth - lineWidth) / 2;
            }
            
            ctx.fillText(line, lineX, currentY);
            currentY += lineHeight + (index < lines.length - 1 ? internalLineSpacing : 0);
        });
    });
    
    // Draw red border around canvas area
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function updateZoneGridAspectRatio() {
    const width = parseInt(elements.canvasWidth.value) || 1584;
    const height = parseInt(elements.canvasHeight.value) || 396;
    const aspectRatio = width / height;
    
    if (elements.zoneGrid) {
        elements.zoneGrid.style.aspectRatio = `${width} / ${height}`;
    }
    
    const hintElement = document.getElementById('canvas-dimensions-hint');
    if (hintElement) {
        const formatRatio = (num) => {
            const rounded = Math.round(num * 100) / 100;
            return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
        };
        
        const ratioDisplay = aspectRatio >= 1 
            ? `${formatRatio(aspectRatio)}:1` 
            : `1:${formatRatio(1/aspectRatio)}`;
        hintElement.textContent = `Canvas: ${width}×${height} (${ratioDisplay} ratio)`;
    }
}

function isLinkedInDimensions() {
    const width = parseInt(elements.canvasWidth.value);
    const height = parseInt(elements.canvasHeight.value);
    return width === 1584 && height === 396;
}

function setPreviewModeBasedOnDimensions() {
    if (isLinkedInDimensions()) {
        elements.previewLinkedin.checked = true;
        elements.previewContainer.setAttribute('data-mode', 'linkedin');
    } else {
        elements.previewBasic.checked = true;
        elements.previewContainer.setAttribute('data-mode', 'basic');
    }
}

async function renderBanner() {
    elements.renderBtn.disabled = true;
    elements.loading.style.display = 'flex';
    
    // Set preview mode based on canvas dimensions
    setPreviewModeBasedOnDimensions();
    
    const params = {
        mask_filename: state.maskFilename,
        canvas_width: parseInt(elements.canvasWidth.value),
        canvas_height: parseInt(elements.canvasHeight.value),
        mask_fit: state.maskEditor.fitMode,
        font_size: parseInt(elements.fontSize.value),
        horizontal_spacing: parseInt(elements.horizontalSpacing.value),
        vertical_spacing: parseInt(elements.verticalSpacing.value),
        font_family: elements.fontFamily.value,
        bold_digits: elements.boldDigits.checked,
        font_color: elements.gridFontColor.value,
        resolution: parseInt(elements.resolution.value),
        apply_blur: elements.applyBlur.checked,
        clip_threshold: parseFloat(elements.clipThreshold.value),
        background_color: elements.gridBackgroundColor.value,
        text_zones: Object.values(state.textZones)
    };
    
    try {
        const response = await fetch('/api/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store the preview URL for mode switching
            state.currentBannerPreview = data.preview;
            
            // Show the preview section with animation
            const previewSection = document.getElementById('final-preview-section');
            if (previewSection) {
                // Trigger reflow to enable transition
                setTimeout(() => {
                    previewSection.classList.add('show');
                }, 10);
            }
            
            // Display in current mode
            displayBannerPreview(data.preview);
            
            elements.downloadBtn.style.display = 'block';
            elements.downloadBtn.onclick = () => window.open(data.download_url, '_blank');
            showNotification('Banner generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Rendering failed', 'error');
            elements.previewContainer.innerHTML = `<p class="empty-state" style="color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        console.error('Render error:', error);
        showNotification('Failed to render banner', 'error');
        elements.previewContainer.innerHTML = '<p class="empty-state" style="color: red;">Failed to render banner. Check console for details.</p>';
    } finally {
        elements.renderBtn.disabled = false;
        elements.loading.style.display = 'none';
    }
}

function getLinkedInProfileData() {
    // Check if customization is enabled
    const customizeToggle = document.getElementById('linkedin-customize-toggle');
    const isCustomized = customizeToggle && customizeToggle.checked;
    
    // Default values
    const defaults = {
        name: "Santa Claus",
        headline: "Chief Logistics Officer · Same-night global fulfillment",
        position: "Chief Logistics Officer",
        company: "North Pole Workshop, Inc.",
        location: "North Pole",
        connections: "500+ connections",
        avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-HuFIN87l2l1negVH1zoIhDHyAA2Jkk_TPA&s",
        companyLogo: "https://img.freepik.com/premium-vector/north-arrow-compass-icon-logo-design_691652-490.jpg",
        educationName: "University of the North Pole (UNP)",
        educationLogo: "https://static.wixstatic.com/media/246f26_b9ea09ddb72a4a9db39e4e1adbe223a8~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
    };
    
    // If customization is not enabled, return defaults
    if (!isCustomized) {
        return {
            name: defaults.name,
            headline: defaults.headline,
            location: defaults.location,
            connections: defaults.connections,
            avatarUrl: defaults.avatarUrl,
            company: {
                name: defaults.company,
                logo: defaults.companyLogo
            },
            education: {
                name: defaults.educationName,
                logo: defaults.educationLogo
            }
        };
    }
    
    // Get custom values from inputs (check both card and modal inputs)
    const nameInput = document.getElementById('linkedin-name') || document.getElementById('linkedin-name-modal');
    const headlineInput = document.getElementById('linkedin-headline-modal');
    const positionInput = document.getElementById('linkedin-position-modal');
    const companyInput = document.getElementById('linkedin-company-modal');
    const locationInput = document.getElementById('linkedin-location-modal');
    const connectionsInput = document.getElementById('linkedin-connections-modal');
    const photoInput = document.getElementById('linkedin-profile-photo');
    
    // Get profile photo URL if uploaded
    let avatarUrl = defaults.avatarUrl;
    if (photoInput && photoInput.files && photoInput.files[0]) {
        avatarUrl = URL.createObjectURL(photoInput.files[0]);
    }
    
    // Build headline from position and company if headline is not provided
    const position = positionInput?.value?.trim() || defaults.position;
    const company = companyInput?.value?.trim() || defaults.company;
    const headline = headlineInput?.value?.trim() || `${position} at ${company}`;
    
    return {
        name: nameInput?.value?.trim() || defaults.name,
        headline: headline,
        location: locationInput?.value?.trim() || defaults.location,
        connections: connectionsInput?.value?.trim() || defaults.connections,
        avatarUrl: avatarUrl,
        company: {
            name: company,
            logo: defaults.companyLogo
        },
        education: {
            name: defaults.educationName,
            logo: defaults.educationLogo
        }
    };
}

function displayBannerPreview(imageUrl) {
    const mode = elements.previewContainer.getAttribute('data-mode');
    
    if (mode === 'linkedin') {
        // LinkedIn preview mode with full profile information
        const linkedinProfile = getLinkedInProfileData();
        
        elements.previewContainer.innerHTML = `
            <div class="linkedin-preview-wrapper">
                <img src="${imageUrl}" alt="Banner preview" class="banner-image">
                <div class="profile-section">
                    <div class="profile-main">
                        <div class="profile-header">
                            <div class="profile-picture-overlay">
                                <img src="${linkedinProfile.avatarUrl}" alt="${linkedinProfile.name}">
                            </div>
                            <div class="profile-info">
                                <h1 class="profile-name">${linkedinProfile.name}</h1>
                                <p class="profile-headline">${linkedinProfile.headline}</p>
                                <p class="profile-location">${linkedinProfile.location}</p>
                                <p class="profile-connections">${linkedinProfile.connections}</p>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button class="linkedin-btn linkedin-btn-primary">Open to</button>
                            <button class="linkedin-btn linkedin-btn-secondary">Add profile section</button>
                            <button class="linkedin-btn linkedin-btn-secondary">More</button>
                        </div>
                    </div>
                    <div class="profile-sidebar">
                        <div class="profile-org-item">
                            <img src="${linkedinProfile.company.logo}" alt="${linkedinProfile.company.name}">
                            <span>${linkedinProfile.company.name}</span>
                        </div>
                        <div class="profile-org-item">
                            <img src="${linkedinProfile.education.logo}" alt="${linkedinProfile.education.name}">
                            <span>${linkedinProfile.education.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Basic mode - just show the banner
        elements.previewContainer.innerHTML = `<img src="${imageUrl}" alt="Banner preview">`;
    }
}

function updatePreviewMode(mode) {
    elements.previewContainer.setAttribute('data-mode', mode);
    
    // Re-display the current banner if one exists
    if (state.currentBannerPreview) {
        displayBannerPreview(state.currentBannerPreview);
    }
}

function downloadBanner() {
    // Handled by onclick in renderBanner()
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#68C7EC',
        error: '#f44336',
        info: '#2196f3'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Mask Editor Functions
// ===================================

function initializeMaskEditor() {
    // Initialize canvas and context
    state.maskEditor.canvas = elements.maskEditorCanvas;
    state.maskEditor.ctx = state.maskEditor.canvas.getContext('2d');
    
    // Create brush layer canvas if needed
    if (!state.maskEditor.brushLayer) {
        state.maskEditor.brushLayer = document.createElement('canvas');
    }
    
    // Initialize threshold slider progress
    updateSliderProgress(elements.thresholdSlider);
    updateSliderProgress(elements.brushSize);
    
    // Only render if we have an image loaded
    if (state.maskEditor.originalImage) {
        // Apply initial threshold to ensure masks are editable
        // This processes the image through the threshold pipeline
        applyThreshold();
    }
    
    // Add mouse event listeners for brush tool (only once)
    if (!state.maskEditor.brushInitialized) {
        setupBrushTool();
        state.maskEditor.brushInitialized = true;
    }
}

function setupBrushTool() {
    const canvas = elements.maskEditorCanvas;
    const container = canvas.parentElement;
    
    canvas.addEventListener('mousedown', (e) => {
        state.maskEditor.isDrawing = true;
        drawBrush(e);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        // Update cursor position
        updateBrushCursorPosition(e);
        
        // Draw if mouse is down
        if (state.maskEditor.isDrawing) {
            drawBrush(e);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        state.maskEditor.isDrawing = false;
    });
    
    canvas.addEventListener('mouseenter', () => {
        elements.brushCursor.style.display = 'block';
        updateBrushCursor();
    });
    
    canvas.addEventListener('mouseleave', () => {
        state.maskEditor.isDrawing = false;
        elements.brushCursor.style.display = 'none';
    });
}

function updateBrushCursorPosition(e) {
    const container = elements.maskEditorCanvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate position relative to the container
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    elements.brushCursor.style.left = x + 'px';
    elements.brushCursor.style.top = y + 'px';
}

function updateBrushCursor() {
    if (!elements.brushCursor) return;
    
    // Update size (multiply by scale to match actual brush size on canvas)
    const displaySize = state.maskEditor.brushSize * 2; // Visual size
    elements.brushCursor.style.width = displaySize + 'px';
    elements.brushCursor.style.height = displaySize + 'px';
    
    // Update color class
    elements.brushCursor.classList.remove('white', 'black');
    elements.brushCursor.classList.add(state.maskEditor.brushColor);
}

function drawBrush(e) {
    const canvas = elements.maskEditorCanvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = state.maskEditor.ctx;
    const brushSize = state.maskEditor.brushSize;
    const color = state.maskEditor.brushColor === 'white' ? 255 : 0;
    
    // Draw on canvas
    ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Also track on brush layer for potential clearing
    const brushCtx = state.maskEditor.brushLayer.getContext('2d');
    brushCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    brushCtx.beginPath();
    brushCtx.arc(x, y, brushSize, 0, Math.PI * 2);
    brushCtx.fill();
    
    // Mark as having unsaved changes
    state.maskEditor.hasUnsavedChanges = true;
}

function setFitMode(mode) {
    state.maskEditor.fitMode = mode;
    
    // Update button states
    document.querySelectorAll('.fit-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'contain') elements.fitContain.classList.add('active');
    else if (mode === 'cover') elements.fitCover.classList.add('active');
    else if (mode === 'stretch') elements.fitStretch.classList.add('active');
    
    // Re-render canvas with new fit mode
    renderMaskCanvas();
    
    // Mark as having unsaved changes
    state.maskEditor.hasUnsavedChanges = true;
}

function renderMaskCanvas() {
    if (!state.maskEditor.currentImage) return;
    
    const canvas = elements.maskEditorCanvas;
    const ctx = state.maskEditor.ctx;
    const img = state.maskEditor.currentImage;
    
    // Get canvas dimensions from user settings
    const targetWidth = parseInt(elements.canvasWidth.value);
    const targetHeight = parseInt(elements.canvasHeight.value);
    
    // Set canvas size
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Initialize brush layer if needed
    if (!state.maskEditor.brushLayer) {
        state.maskEditor.brushLayer = document.createElement('canvas');
    }
    if (!state.maskEditor.brushLayer.width) {
        state.maskEditor.brushLayer.width = targetWidth;
        state.maskEditor.brushLayer.height = targetHeight;
    }
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions based on fit mode
    let drawWidth, drawHeight, drawX, drawY;
    
    if (state.maskEditor.fitMode === 'stretch') {
        drawWidth = canvas.width;
        drawHeight = canvas.height;
        drawX = 0;
        drawY = 0;
    } else if (state.maskEditor.fitMode === 'contain') {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = (canvas.height - drawHeight) / 2;
    } else { // cover
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = (canvas.height - drawHeight) / 2;
    }
    
    // Disable image smoothing for crisp pixel-perfect rendering (nearest neighbor)
    ctx.imageSmoothingEnabled = false;
    
    // Draw image
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    // Apply brush layer if exists
    if (state.maskEditor.brushLayer && state.maskEditor.brushLayer.width) {
        ctx.drawImage(state.maskEditor.brushLayer, 0, 0);
    }
}

function applyThreshold() {
    if (!state.maskEditor.originalImage) return;
    
    elements.maskEditorLoading.style.display = 'flex';
    
    // Create a temporary canvas to process the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = state.maskEditor.originalImage.width;
    tempCanvas.height = state.maskEditor.originalImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Disable smoothing for pixel-perfect rendering
    tempCtx.imageSmoothingEnabled = false;
    
    // Draw original image
    tempCtx.drawImage(state.maskEditor.originalImage, 0, 0);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    const threshold = state.maskEditor.threshold;
    
    // Apply threshold
    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply threshold
        let value = gray >= threshold ? 255 : 0;
        
        // Apply invert if enabled
        if (state.maskEditor.invert) {
            value = 255 - value;
        }
        
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
    }
    
    // Put processed data back
    tempCtx.putImageData(imageData, 0, 0);
    
    // Create new image from processed canvas
    const processedImage = new Image();
    processedImage.onload = () => {
        state.maskEditor.currentImage = processedImage;
        renderMaskCanvas();
        elements.maskEditorLoading.style.display = 'none';
    };
    processedImage.src = tempCanvas.toDataURL();
}

function clearBrushEdits() {
    if (!state.maskEditor.brushLayer) return;
    
    // Clear brush layer
    const ctx = state.maskEditor.brushLayer.getContext('2d');
    ctx.clearRect(0, 0, state.maskEditor.brushLayer.width, state.maskEditor.brushLayer.height);
    
    // Re-render canvas without brush edits
    renderMaskCanvas();
    showNotification('Brush edits cleared', 'success');
}

function resetMaskToOriginal() {
    if (!state.maskEditor.originalImage) return;
    
    // Reset to original image
    state.maskEditor.currentImage = state.maskEditor.originalImage;
    state.maskEditor.threshold = 128;
    state.maskEditor.invert = false;
    elements.thresholdSlider.value = 128;
    elements.thresholdValue.textContent = '128';
    elements.invertMask.checked = false;
    
    // Clear brush layer
    if (state.maskEditor.brushLayer) {
        const ctx = state.maskEditor.brushLayer.getContext('2d');
        ctx.clearRect(0, 0, state.maskEditor.brushLayer.width, state.maskEditor.brushLayer.height);
    }
    
    renderMaskCanvas();
    showNotification('Reset to original mask', 'success');
}

async function saveMaskFromEditor() {
    if (!elements.maskEditorCanvas) return null;
    
    // Convert canvas to blob
    return new Promise((resolve) => {
        elements.maskEditorCanvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

async function saveEditedMaskToServer() {
    if (!elements.maskEditorCanvas) return;
    
    try {
        // Get canvas data as base64
        const imageData = elements.maskEditorCanvas.toDataURL('image/png');
        
        // Send to server
        const response = await fetch('/api/save_edited_mask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image_data: imageData })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update state with new filename
            state.maskFilename = data.filename;
            showNotification('Mask edits saved!', 'success');
        } else {
            showNotification(data.error || 'Failed to save mask', 'error');
        }
    } catch (error) {
        console.error('Error saving edited mask:', error);
        showNotification('Failed to save mask edits', 'error');
    }
}

// LinkedIn Options Modal with value syncing
const linkedinViewMoreBtn = document.getElementById('linkedin-view-more');
const linkedinOptionsModal = document.getElementById('linkedin-options-modal');
const linkedinModalCloseBtn = document.getElementById('linkedin-modal-close-btn');
const linkedinModalCloseX = document.querySelector('.linkedin-modal-close');

// Field pairs for syncing (card -> modal)
const linkedinFieldPairs = [
    { card: 'linkedin-name', modal: 'linkedin-name-modal' },
    { card: 'linkedin-profile-photo', modal: 'linkedin-profile-photo-modal' },
    { cardFilename: 'linkedin-photo-filename', modalFilename: 'linkedin-photo-filename-modal' }
];

// Store the current file for syncing
let linkedinCurrentFile = null;

// Sync values from card to modal when opening
function syncCardToModal() {
    const nameCard = document.getElementById('linkedin-name');
    const nameModal = document.getElementById('linkedin-name-modal');
    if (nameCard && nameModal) {
        nameModal.value = nameCard.value;
    }
    
    const filenameCard = document.getElementById('linkedin-photo-filename');
    const filenameModal = document.getElementById('linkedin-photo-filename-modal');
    if (filenameCard && filenameModal) {
        filenameModal.textContent = filenameCard.textContent;
    }
}

// Sync values from modal to card when closing
function syncModalToCard() {
    const nameCard = document.getElementById('linkedin-name');
    const nameModal = document.getElementById('linkedin-name-modal');
    if (nameCard && nameModal) {
        nameCard.value = nameModal.value;
    }
    
    const filenameCard = document.getElementById('linkedin-photo-filename');
    const filenameModal = document.getElementById('linkedin-photo-filename-modal');
    if (filenameCard && filenameModal) {
        filenameCard.textContent = filenameModal.textContent;
    }
    
    // Sync file if one was selected in modal
    if (linkedinCurrentFile) {
        const photoCard = document.getElementById('linkedin-profile-photo');
        if (photoCard) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(linkedinCurrentFile);
            photoCard.files = dataTransfer.files;
        }
    }
}

if (linkedinViewMoreBtn && linkedinOptionsModal) {
    linkedinViewMoreBtn.addEventListener('click', () => {
        syncCardToModal();
        linkedinOptionsModal.style.display = 'flex';
    });
}

if (linkedinModalCloseBtn && linkedinOptionsModal) {
    linkedinModalCloseBtn.addEventListener('click', () => {
        syncModalToCard();
        applyLinkedInChanges();
        linkedinOptionsModal.style.display = 'none';
    });
}

if (linkedinModalCloseX && linkedinOptionsModal) {
    linkedinModalCloseX.addEventListener('click', () => {
        syncModalToCard();
        linkedinOptionsModal.style.display = 'none';
    });
}

// Close modal when clicking outside
if (linkedinOptionsModal) {
    linkedinOptionsModal.addEventListener('click', (e) => {
        if (e.target === linkedinOptionsModal) {
            syncModalToCard();
            linkedinOptionsModal.style.display = 'none';
        }
    });
}

// Real-time syncing for text inputs
const linkedinNameCard = document.getElementById('linkedin-name');
const linkedinNameModal = document.getElementById('linkedin-name-modal');

if (linkedinNameCard && linkedinNameModal) {
    linkedinNameCard.addEventListener('input', (e) => {
        linkedinNameModal.value = e.target.value;
    });
    
    linkedinNameModal.addEventListener('input', (e) => {
        linkedinNameCard.value = e.target.value;
    });
}

// LinkedIn customize toggle
const linkedinCustomizeToggle = document.getElementById('linkedin-customize-toggle');
const linkedinCustomFields = document.getElementById('linkedin-custom-fields');
const linkedinDescription = document.getElementById('linkedin-description');

if (linkedinCustomizeToggle && linkedinCustomFields) {
    linkedinCustomizeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            linkedinCustomFields.style.display = 'block';
            if (linkedinDescription) {
                linkedinDescription.style.display = 'none';
            }
            // Initialize as saved state (no changes yet)
            linkedinSettingsSaved = true;
            updateApplyChangesButton();
        } else {
            linkedinCustomFields.style.display = 'none';
            if (linkedinDescription) {
                linkedinDescription.style.display = 'block';
            }
            // Reset to default when disabled
            if (state.currentBannerPreview) {
                displayBannerPreview(state.currentBannerPreview);
            }
        }
    });
}

// LinkedIn settings saved state
let linkedinSettingsSaved = false;

function applyLinkedInChanges() {
    linkedinSettingsSaved = true;
    updateApplyChangesButton();
    
    if (state.currentBannerPreview) {
        displayBannerPreview(state.currentBannerPreview);
        showNotification('LinkedIn preview updated!', 'success');
    } else {
        showNotification('Settings saved! Generate a banner to see the preview.', 'success');
    }
}

function updateApplyChangesButton() {
    const btn = document.getElementById('linkedin-apply-changes');
    if (btn) {
        if (linkedinSettingsSaved) {
            btn.textContent = 'Settings Saved';
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.textContent = 'Apply Changes to Preview';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
}

// Mark settings as unsaved when any input changes
const linkedinInputsForTracking = [
    'linkedin-name',
    'linkedin-name-modal',
    'linkedin-profile-photo',
    'linkedin-profile-photo-modal',
    'linkedin-headline-modal',
    'linkedin-position-modal',
    'linkedin-company-modal',
    'linkedin-location-modal',
    'linkedin-connections-modal'
];

linkedinInputsForTracking.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            linkedinSettingsSaved = false;
            updateApplyChangesButton();
        });
        if (input.type === 'file') {
            input.addEventListener('change', () => {
                linkedinSettingsSaved = false;
                updateApplyChangesButton();
            });
        }
    }
});

// LinkedIn Apply Changes button
const linkedinApplyChangesBtn = document.getElementById('linkedin-apply-changes');
if (linkedinApplyChangesBtn) {
    linkedinApplyChangesBtn.addEventListener('click', () => {
        applyLinkedInChanges();
    });
}

// LinkedIn Profile Photo file upload
const linkedinProfilePhoto = document.getElementById('linkedin-profile-photo');
const linkedinPhotoFilename = document.getElementById('linkedin-photo-filename');
const linkedinProfilePhotoModal = document.getElementById('linkedin-profile-photo-modal');
const linkedinPhotoFilenameModal = document.getElementById('linkedin-photo-filename-modal');

if (linkedinProfilePhoto && linkedinPhotoFilename) {
    linkedinProfilePhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            linkedinPhotoFilename.textContent = file.name;
            linkedinCurrentFile = file;
            // Sync to modal
            if (linkedinPhotoFilenameModal) {
                linkedinPhotoFilenameModal.textContent = file.name;
            }
        } else {
            linkedinPhotoFilename.textContent = 'No file chosen';
        }
    });
}

if (linkedinProfilePhotoModal && linkedinPhotoFilenameModal) {
    linkedinProfilePhotoModal.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            linkedinPhotoFilenameModal.textContent = file.name;
            linkedinCurrentFile = file;
            // Sync to card
            if (linkedinPhotoFilename) {
                linkedinPhotoFilename.textContent = file.name;
            }
        } else {
            linkedinPhotoFilenameModal.textContent = 'No file chosen';
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Carousel functionality
let currentSlideIndex = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const thumbnails = document.querySelectorAll('.carousel-thumbnail');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and thumbnail
    slides[currentSlideIndex].classList.remove('active');
    thumbnails[currentSlideIndex].classList.remove('active');
    
    // Calculate new index
    currentSlideIndex += direction;
    
    // Wrap around
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Add active class to new slide and thumbnail
    slides[currentSlideIndex].classList.add('active');
    thumbnails[currentSlideIndex].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const thumbnails = document.querySelectorAll('.carousel-thumbnail');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and thumbnail
    slides[currentSlideIndex].classList.remove('active');
    thumbnails[currentSlideIndex].classList.remove('active');
    
    // Set new index
    currentSlideIndex = index;
    
    // Add active class to new slide and thumbnail
    slides[currentSlideIndex].classList.add('active');
    thumbnails[currentSlideIndex].classList.add('active');
}

// Optional: Auto-advance carousel every 5 seconds (can be disabled)
// Uncomment the following lines to enable auto-play:
// setInterval(() => {
//     if (document.querySelector('.carousel-container')) {
//         changeSlide(1);
//     }
// }, 5000);

// Gallery fullscreen functions
function openGalleryFullscreen(imageSrc, label) {
    const modal = document.getElementById('gallery-fullscreen-modal');
    const img = document.getElementById('gallery-fullscreen-img');
    const labelEl = document.getElementById('gallery-fullscreen-label');
    
    if (modal && img && labelEl) {
        img.src = imageSrc;
        labelEl.textContent = label;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeGalleryFullscreen() {
    const modal = document.getElementById('gallery-fullscreen-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close fullscreen modal when clicking outside the image
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gallery-fullscreen-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeGalleryFullscreen();
            }
        });
    }
    
    // Add click handlers to all carousel slide images
    const setupGalleryClickHandlers = () => {
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide) => {
            const img = slide.querySelector('img');
            const caption = slide.querySelector('.carousel-caption-overlay p');
            
            if (img && caption) {
                img.addEventListener('click', () => {
                    openGalleryFullscreen(img.src, caption.textContent);
                });
            }
        });
    };
    
    setupGalleryClickHandlers();
});

// Make functions globally accessible
window.openZoneEditor = openZoneEditor;
window.goToStep = goToStep;
window.scrollToSection = scrollToSection;
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;
window.openGalleryFullscreen = openGalleryFullscreen;
window.closeGalleryFullscreen = closeGalleryFullscreen;
