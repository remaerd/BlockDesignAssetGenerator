import * as THREE from 'three';
import { createScene } from './scene.js';
import { createCube } from './cube.js';
import gsap from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const { scene, camera, renderer } = createScene(canvas);

    const cube = createCube();
    scene.add(cube);

    let line;

    function createStroke() {
        if (line) {
            cube.remove(line);
        }
        const edges = new THREE.EdgesGeometry(cube.geometry);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
        line = new THREE.LineSegments(edges, lineMat);
        cube.add(line);
    }

    createStroke();

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    let isDragging = false;
    const previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition.x = e.clientX;
        previousMousePosition.y = e.clientY;
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            cube.rotation.y += deltaX * 0.01;
            cube.rotation.x += deltaY * 0.01;

            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        }
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });

    renderer.domElement.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    const toggleUiButton = document.getElementById('toggleUiButton');
    const panels = document.querySelectorAll('.panel');
    let uiVisible = true;

    toggleUiButton.addEventListener('click', () => {
        uiVisible = !uiVisible;
        panels.forEach(panel => {
            panel.style.display = uiVisible ? 'block' : 'none';
        });
    });

    // Rotation and View Controls
    const rotateX90 = document.getElementById('rotateX90');
    const rotateX_90 = document.getElementById('rotateX-90');
    const rotateY90 = document.getElementById('rotateY90');
    const rotateY_90 = document.getElementById('rotateY-90');
    const rotateZ90 = document.getElementById('rotateZ90');
    const rotateZ_90 = document.getElementById('rotateZ-90');
    const viewIsometric = document.getElementById('viewIsometric');
    const viewFlat = document.getElementById('viewFlat');

    const PI_HALF = Math.PI / 2;
    const rotationDuration = 0.5;

    rotateX90.addEventListener('click', () => gsap.to(cube.rotation, { x: cube.rotation.x + PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));
    rotateX_90.addEventListener('click', () => gsap.to(cube.rotation, { x: cube.rotation.x - PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));
    rotateY90.addEventListener('click', () => gsap.to(cube.rotation, { y: cube.rotation.y + PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));
    rotateY_90.addEventListener('click', () => gsap.to(cube.rotation, { y: cube.rotation.y - PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));
    rotateZ90.addEventListener('click', () => gsap.to(cube.rotation, { z: cube.rotation.z + PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));
    rotateZ_90.addEventListener('click', () => gsap.to(cube.rotation, { z: cube.rotation.z - PI_HALF, duration: rotationDuration, ease: 'power4.inOut' }));

    let currentViewMode = 'isometric';
    const flatViewFaces = ['front', 'back', 'top', 'bottom', 'right', 'left'];
    let flatViewFaceIndex = 0;

    function setView(viewMode, face) {
        currentViewMode = viewMode;
        const viewChangeDuration = 0.7;
        const ease = 'power4.inOut';

        const onUpdate = () => camera.lookAt(scene.position);

        if (viewMode === 'isometric') {
            gsap.to(camera.position, { x: 20, y: 20, z: 20, duration: viewChangeDuration, ease, onUpdate });
            gsap.to(cube.rotation, { x: 0, y: 0, z: 0, duration: viewChangeDuration, ease });
            viewIsometric.classList.add('active');
            viewFlat.classList.remove('active');
        } else { // 2D Flat view
            gsap.to(cube.rotation, { x: 0, y: 0, z: 0, duration: viewChangeDuration, ease });
            const distance = 15;
            let targetPosition = { x: 0, y: 0, z: 0 };
            switch (face) {
                case 'front': targetPosition = { x: 0, y: 0, z: distance }; break;
                case 'back': targetPosition = { x: 0, y: 0, z: -distance }; break;
                case 'top': targetPosition = { x: 0, y: distance, z: 0 }; break;
                case 'bottom': targetPosition = { x: 0, y: -distance, z: 0 }; break;
                case 'right': targetPosition = { x: distance, y: 0, z: 0 }; break;
                case 'left': targetPosition = { x: -distance, y: 0, z: 0 }; break;
            }
            gsap.to(camera.position, { ...targetPosition, duration: viewChangeDuration, ease, onUpdate });
            viewIsometric.classList.remove('active');
            viewFlat.classList.add('active');
        }
    }

    viewIsometric.addEventListener('click', () => {
        if (currentViewMode !== 'isometric') {
            setView('isometric');
        }
    });

    viewFlat.addEventListener('click', () => {
        if (currentViewMode !== 'flat') {
            flatViewFaceIndex = 0;
            setView('flat', flatViewFaces[flatViewFaceIndex]);
        } else {
            flatViewFaceIndex = (flatViewFaceIndex + 1) % flatViewFaces.length;
            setView('flat', flatViewFaces[flatViewFaceIndex]);
        }
    });

    const textInputs = {
        front: document.getElementById('frontText'),
        back: document.getElementById('backText'),
        top: document.getElementById('topText'),
        bottom: document.getElementById('bottomText'),
        right: document.getElementById('rightText'),
        left: document.getElementById('leftText'),
    };

    const colorInputs = {
        front: document.getElementById('frontColor'),
        back: document.getElementById('backColor'),
        top: document.getElementById('topColor'),
        bottom: document.getElementById('bottomColor'),
        right: document.getElementById('rightColor'),
        left: document.getElementById('leftColor'),
    };

    const faceMapping = {
        front: 0,
        back: 1,
        top: 2,
        bottom: 3,
        right: 4,
        left: 5,
    };

    for (const face in textInputs) {
        textInputs[face].addEventListener('input', (e) => {
            const content = e.target.value;
            const faceIndex = faceMapping[face];
            const color = colorInputs[face].value;
            updateCubeContent(faceIndex, content, color);
        });

        colorInputs[face].addEventListener('input', (e) => {
            const color = e.target.value;
            const faceIndex = faceMapping[face];
            const content = textInputs[face].value;
            updateCubeContent(faceIndex, content, color);
        });
    }

    function updateCubeContent(faceIndex, content, color) {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 512;
        const context = textCanvas.getContext('2d');

        context.fillStyle = color;
        context.fillRect(0, 0, textCanvas.width, textCanvas.height);
        context.fillStyle = 'white';
        context.font = '64pt Helvetica';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        if (content.trim() !== '') {
            const padding = 40; // Added padding
            const words = content.split(' ');
            let line = '';
            let y = padding; // Start y with padding
            const lineHeight = 74;
            const x = padding; // Start x with padding
            const maxWidth = textCanvas.width - (padding * 2); // Adjust max width

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
        }

        const texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.needsUpdate = true;
        const material = new THREE.MeshBasicMaterial({ map: texture });

        if (cube.material[faceIndex]) {
            cube.material[faceIndex] = material;
            cube.material[faceIndex].needsUpdate = true;
        }
    }

    const contentToggles = {
        front: document.querySelectorAll('input[name="frontContent"]'),
        back: document.querySelectorAll('input[name="backContent"]'),
        top: document.querySelectorAll('input[name="topContent"]'),
        bottom: document.querySelectorAll('input[name="bottomContent"]'),
        right: document.querySelectorAll('input[name="rightContent"]'),
        left: document.querySelectorAll('input[name="leftContent"]'),
    };

    const contentContainers = {
        front: {
            text: document.getElementById('frontTextContainer'),
            image: document.getElementById('frontImageContainer'),
            video: document.getElementById('frontVideoContainer'),
        },
        back: {
            text: document.getElementById('backTextContainer'),
            image: document.getElementById('backImageContainer'),
            video: document.getElementById('backVideoContainer'),
        },
        top: {
            text: document.getElementById('topTextContainer'),
            image: document.getElementById('topImageContainer'),
            video: document.getElementById('topVideoContainer'),
        },
        bottom: {
            text: document.getElementById('bottomTextContainer'),
            image: document.getElementById('bottomImageContainer'),
            video: document.getElementById('bottomVideoContainer'),
        },
        right: {
            text: document.getElementById('rightTextContainer'),
            image: document.getElementById('rightImageContainer'),
            video: document.getElementById('rightVideoContainer'),
        },
        left: {
            text: document.getElementById('leftTextContainer'),
            image: document.getElementById('leftImageContainer'),
            video: document.getElementById('leftVideoContainer'),
        },
    };

    for (const face in contentToggles) {
        contentToggles[face].forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const contentType = e.target.value;
                for (const type in contentContainers[face]) {
                    contentContainers[face][type].style.display = type === contentType ? 'block' : 'none';
                }
            });
        });
    }

    const imageInputs = {
        front: document.getElementById('frontImage'),
        back: document.getElementById('backImage'),
        top: document.getElementById('topImage'),
        bottom: document.getElementById('bottomImage'),
        right: document.getElementById('rightImage'),
        left: document.getElementById('leftImage'),
    };

    const videoInputs = {
        front: document.getElementById('frontVideo'),
        back: document.getElementById('backVideo'),
        top: document.getElementById('topVideo'),
        bottom: document.getElementById('bottomVideo'),
        right: document.getElementById('rightVideo'),
        left: document.getElementById('leftVideo'),
    };

    for (const face in imageInputs) {
        imageInputs[face].addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                const faceIndex = faceMapping[face];
                updateCubeImage(faceIndex, url);
            }
        });
    }

    for (const face in videoInputs) {
        videoInputs[face].addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                const faceIndex = faceMapping[face];
                updateCubeVideo(faceIndex, url);
            }
        });
    }

    function updateCubeImage(faceIndex, url) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            const material = new THREE.MeshBasicMaterial({ map: texture });
            if (cube.material[faceIndex]) {
                cube.material[faceIndex] = material;
                cube.material[faceIndex].needsUpdate = true;
            }
            URL.revokeObjectURL(url);
        });
    }

    function updateCubeVideo(faceIndex, url) {
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.play();

        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const material = new THREE.MeshBasicMaterial({ map: texture });

        if (cube.material[faceIndex]) {
            cube.material[faceIndex] = material;
            cube.material[faceIndex].needsUpdate = true;
        }
    }
});