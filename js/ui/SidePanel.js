import { ColorPicker } from './ColorPicker.js';

export class SidePanel {
    constructor(cubeManager, sceneManager) {
        this.cubeManager = cubeManager;
        this.sceneManager = sceneManager;
        this.currentViewMode = 'isometric';
        this.flatViewFaceIndex = 0;
        this.flatViewFaces = ['front', 'back', 'top', 'bottom', 'right', 'left'];
        this.paletteColors = [
            '#f38f7e', '#d97e6a', '#be6d57', '#a35c44', '#884b31', '#6d3a1e',
            '#ffc907', '#d9ac06', '#b38f05', '#8c7204', '#665503', '#403802',
            '#87c375', '#6fa960', '#578f4b', '#3f7536', '#275b21', '#0f410c',
            '#49c4d3', '#3da7b3', '#318a93', '#256d73', '#195053', '#0d3333',
            '#c0b8d1', '#a69eb1', '#8c8491', '#726a71', '#585051', '#3e3631',
            '#e21e26', '#ffffff', '#000000',
        ];

        this.initialize();
    }

    initialize() {
        this.setupRotationControls();
        this.setupViewControls();
        this.setupZoomControls();
        this.setupReplicationControls();
        this.setupBackgroundColorPicker();
        this.setupToggleUI();
    }

    setupToggleUI() {
        const toggleUiButton = document.getElementById('toggleUiButton');
        const mainPanel = document.getElementById('main-panel');
        const leftControls = document.getElementById('left-controls');
        let uiVisible = true;
        toggleUiButton.addEventListener('click', () => {
            uiVisible = !uiVisible;
            mainPanel.style.display = uiVisible ? 'block' : 'none';
            leftControls.style.display = uiVisible ? 'block' : 'none';
        });
    }

    setupRotationControls() {
        const PI_HALF = Math.PI / 2;
        document.getElementById('rotateX90').addEventListener('click', () => this.cubeManager.applyRotation({ x: PI_HALF }));
        document.getElementById('rotateX-90').addEventListener('click', () => this.cubeManager.applyRotation({ x: -PI_HALF }));
        document.getElementById('rotateY90').addEventListener('click', () => this.cubeManager.applyRotation({ y: PI_HALF }));
        document.getElementById('rotateY-90').addEventListener('click', () => this.cubeManager.applyRotation({ y: -PI_HALF }));
    }

    setupViewControls() {
        const viewIsometric = document.getElementById('viewIsometric');
        const viewFlat = document.getElementById('viewFlat');

        viewIsometric.addEventListener('click', () => {
            if (this.currentViewMode !== 'isometric') this.setView('isometric');
        });

        viewFlat.addEventListener('click', () => {
            if (this.currentViewMode !== 'flat') {
                this.flatViewFaceIndex = 0;
            } else {
                this.flatViewFaceIndex = (this.flatViewFaceIndex + 1) % this.flatViewFaces.length;
            }
            this.setView('flat', this.flatViewFaces[this.flatViewFaceIndex]);
        });
    }

    setupZoomControls() {
        const zoomSlider = document.getElementById('zoomSlider');
        zoomSlider.addEventListener('input', (e) => {
            this.sceneManager.setZoom(parseFloat(e.target.value));
        });
    }

    setView(viewMode, face) {
        this.currentViewMode = viewMode;
        const viewIsometric = document.getElementById('viewIsometric');
        const viewFlat = document.getElementById('viewFlat');

        viewIsometric.classList.toggle('is-active', viewMode === 'isometric');
        viewFlat.classList.toggle('is-active', viewMode === 'flat');

        this.cubeManager.applyRotation({ x: 0, y: 0, z: 0 }, true);
        this.sceneManager.changeView(viewMode, face);
    }

    setupReplicationControls() {
        const rowsInput = document.getElementById('replicationRows');
        const colsInput = document.getElementById('replicationCols');
        const gapInput = document.getElementById('replicationGap');

        const handleGridChange = () => this.cubeManager.replicate(
            parseInt(rowsInput.value),
            parseInt(colsInput.value)
        );

        const handleGapChange = () => this.cubeManager.updateLayout(
            parseFloat(gapInput.value)
        );

        rowsInput.addEventListener('input', handleGridChange);
        colsInput.addEventListener('input', handleGridChange);
        gapInput.addEventListener('input', handleGapChange);

        handleGridChange(); // Initial call
        handleGapChange();
    }

    setupBackgroundColorPicker() {
        const dropdown = document.getElementById('backgroundColorDropdown');
        const colorInput = document.getElementById('backgroundColor');
        const colorPreview = document.getElementById('backgroundColorPreview');
        const initialColor = this.sceneManager.scene.background.getStyle();
        
        colorInput.value = initialColor;
        colorPreview.style.backgroundColor = initialColor;

        new ColorPicker(dropdown, colorInput, colorPreview, this.paletteColors, (color) => {
            this.sceneManager.scene.background.set(color);
            this.cubeManager.strokes.forEach(stroke => stroke.material.color.set(color));
        });
    }
}