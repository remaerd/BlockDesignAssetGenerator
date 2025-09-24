import * as THREE from 'three';

export function createScene(canvas) {
    const scene = new THREE.Scene();
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    scene.background = new THREE.Color(isDarkMode ? '#1a1a1a' : '#f0f0f0');
    
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

    camera.position.set(20, 20, 20); // Isometric view
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -d * aspect;
        camera.right = d * aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}