import * as THREE from 'three';
import gsap from 'gsap';

export class SceneManager {
    constructor(canvas) {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(isDarkMode ? '#1a1a1a' : '#f0f0f0');
        
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animationCallbacks = [];
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupMouseControls(onDrag) {
        let isDragging = false;
        const previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                onDrag(deltaX, deltaY);
                previousMousePosition.x = e.clientX;
                previousMousePosition.y = e.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });
        this.renderer.domElement.addEventListener('mouseleave', () => { isDragging = false; });
    }

    setZoom(value) {
        gsap.to(this.camera, {
            zoom: value,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            }
        });
    }

    changeView(viewMode, face, onComplete) {
        const duration = 0.7;
        const ease = 'power4.inOut';
        const onUpdate = () => this.camera.lookAt(this.scene.position);

        if (viewMode === 'isometric') {
            gsap.to(this.camera.position, { x: 20, y: 20, z: 20, duration, ease, onUpdate, onComplete });
        } else { // flat view
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
            gsap.to(this.camera.position, { ...targetPosition, duration, ease, onUpdate, onComplete });
        }
    }

    add(obj) {
        this.scene.add(obj);
    }

    remove(obj) {
        this.scene.remove(obj);
    }

    addCallback(callback) {
        this.animationCallbacks.push(callback);
    }

    start() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.animationCallbacks.forEach(cb => cb());
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}