import * as THREE from 'three';
import { ColorPicker } from './ColorPicker.js';

export class MainPanel {
    constructor(cubeManager, sceneManager) {
        this.cubeManager = cubeManager;
        this.sceneManager = sceneManager;
        this.faceMapping = { right: 0, left: 1, top: 2, bottom: 3, front: 4, back: 5 };
        this.textInputs = {};
        this.colorInputs = {};
        this.qrInputs = {};
        this.paletteColors = [
            '#f38f7e', '#d97e6a', '#be6d57', '#a35c44', '#884b31', '#6d3a1e',
            '#ffc907', '#d9ac06', '#b38f05', '#8c7204', '#665503', '#403802',
            '#87c375', '#6fa960', '#578f4b', '#3f7536', '#275b21', '#0f410c',
            '#49c4d3', '#3da7b3', '#318a93', '#256d73', '#195053', '#0d3333',
            '#c0b8d1', '#a69eb1', '#8c8491', '#726a71', '#585051', '#3e3631',
            '#e21e26', '#ffffff', '#000000',
        ];
        this.stockImages = [
            'assets/images/UWE_Web_Avatar_Bottom-24.png',
            'assets/images/UWE_Web_Avatar_Top-24.png'
        ];

        this.initialize();
    }

    initialize() {
        this.setupTabs();
        this.setupContentToggles();
        this.setupInputListeners();
        this.setupImageGalleries();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('#main-panel .tabs li');
        const tabContents = document.querySelectorAll('#main-panel .tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(item => item.classList.remove('is-active'));
                tab.classList.add('is-active');
                const target = tab.dataset.tab;
                tabContents.forEach(content => {
                    content.style.display = content.id === `${target}-content` ? 'block' : 'none';
                });
            });
        });

        this.sceneManager.addCallback(() => this.updateTabHighlights());
    }

    updateTabHighlights() {
        const visibleFaces = this.cubeManager.getVisibleFaces();
        const tabs = document.querySelectorAll('#main-panel .tabs li');
        const tabContents = document.querySelectorAll('#main-panel .tab-content');

        tabs.forEach(tab => {
            const isVisible = visibleFaces.includes(tab.dataset.tab);
            tab.classList.toggle('is-bold', isVisible);
            tab.classList.toggle('is-disabled', !isVisible);
        });

        tabContents.forEach(content => {
            const faceName = content.id.replace('-content', '');
            content.style.opacity = visibleFaces.includes(faceName) ? '1.0' : '0.5';
        });
    }

    setupContentToggles() {
        const contentToggles = document.querySelectorAll('.content-toggle');

        contentToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const face = toggle.dataset.face;
                const type = toggle.dataset.type;

                // Update button active state
                document.querySelectorAll(`.content-toggle[data-face="${face}"]`).forEach(btn => {
                    btn.classList.remove('is-active');
                });
                toggle.classList.add('is-active');

                // Update container visibility
                const containers = {
                    text: document.getElementById(`${face}TextContainer`),
                    image: document.getElementById(`${face}ImageContainer`),
                    video: document.getElementById(`${face}VideoContainer`),
                    qr: document.getElementById(`${face}QrContainer`),
                };

                for (const containerType in containers) {
                    containers[containerType].style.display = containerType === type ? 'block' : 'none';
                }
            });
        });
    }

    setupInputListeners() {
        for (const face in this.faceMapping) {
            // Text and Color
            this.textInputs[face] = document.getElementById(`${face}Text`);
            this.colorInputs[face] = document.getElementById(`${face}Color`);
            this.createColorDropdown(face);
            this.textInputs[face].addEventListener('input', () => this.handleTextUpdate(face));

            // Image listener is now in setupImageGalleries

            // Video
            document.getElementById(`${face}Video`).addEventListener('change', (e) => this.handleVideoUpdate(face, e.target.files[0]));

            // QR
            this.qrInputs[face] = document.getElementById(`${face}Qr`);
            this.qrInputs[face].addEventListener('input', () => this.handleQrUpdate(face));
        }
    }

    createColorDropdown(face) {
        const dropdown = document.getElementById(`${face}ColorDropdown`);
        const colorInput = this.colorInputs[face];
        const colorPreview = document.getElementById(`${face}ColorPreview`);

        new ColorPicker(dropdown, colorInput, colorPreview, this.paletteColors, (color) => {
            const activeToggle = document.querySelector(`.content-toggle[data-face="${face}"].is-active`);
            if (!activeToggle) return;
            const contentType = activeToggle.dataset.type;
            
            if (contentType === 'text') this.handleTextUpdate(face);
            else if (contentType === 'qr') this.handleQrUpdate(face);
        });
    }

    setupImageGalleries() {
        for (const face in this.faceMapping) {
            const gallery = document.getElementById(`${face}ImageGallery`);
            
            // Add stock images
            this.stockImages.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.addEventListener('click', () => this.handleImageUpdate(face, imageUrl));
                gallery.appendChild(img);
            });

            // Setup upload button
            const uploadInput = gallery.querySelector('.image-upload-input');
            uploadInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleImageUpdate(face, e.target.files[0]);
                }
            });
        }
    }

    updateQrCodeBackgrounds() {
        for (const face in this.faceMapping) {
            const activeToggle = document.querySelector(`.content-toggle[data-face="${face}"].is-active`);
            if (activeToggle && activeToggle.dataset.type === 'qr') {
                this.handleQrUpdate(face);
            }
        }
    }

    handleTextUpdate(face) {
        const faceIndex = this.faceMapping[face];
        const content = this.textInputs[face].value;
        const color = this.colorInputs[face].value;
        
        const textCanvas = this.cubeManager.createTextCanvas(content, color);
        const texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.cubeManager.updateFaceMaterial(faceIndex, material);
    }

    handleImageUpdate(face, imageSource) {
        let url;
        if (typeof imageSource === 'string') {
            url = imageSource;
        } else if (imageSource instanceof File) {
            if (!imageSource) return;
            url = URL.createObjectURL(imageSource);
        } else {
            return;
        }

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.cubeManager.updateFaceMaterial(this.faceMapping[face], material);
            if (imageSource instanceof File) {
                URL.revokeObjectURL(url);
            }
        });
    }

    handleVideoUpdate(face, file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.play();
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.cubeManager.updateFaceMaterial(this.faceMapping[face], material);
    }

    handleQrUpdate(face) {
        const faceIndex = this.faceMapping[face];
        const url = this.qrInputs[face].value;
        const color = this.colorInputs[face].value;

        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = 512;
        qrCanvas.height = 512;
        const context = qrCanvas.getContext('2d');

        const qrColor = this.cubeManager.getContrastingTextColor(color);

        if (url.trim() !== '') {
            const tempQrContainer = document.createElement('div');
            tempQrContainer.style.position = 'absolute';
            tempQrContainer.style.left = '-9999px';
            document.body.appendChild(tempQrContainer);

            new QRCode(tempQrContainer, { text: url, width: 512, height: 512, colorDark: qrColor, colorLight: 'rgba(0,0,0,0)', correctLevel: QRCode.CorrectLevel.H });

            setTimeout(() => {
                const generatedCanvas = tempQrContainer.querySelector('canvas');
                if (generatedCanvas) {
                    context.drawImage(generatedCanvas, 0, 0, qrCanvas.width, qrCanvas.height);
                    const texture = new THREE.CanvasTexture(qrCanvas);
                    texture.minFilter = THREE.LinearFilter;
                    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, color: color });
                    this.cubeManager.updateFaceMaterial(faceIndex, material);
                }
                document.body.removeChild(tempQrContainer);
            }, 100);
        } else {
            const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
            this.cubeManager.updateFaceMaterial(faceIndex, material);
        }
    }
}