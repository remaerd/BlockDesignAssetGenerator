import * as THREE from 'three';

export function createCube() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    // Order: right, left, top, bottom, front, back
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xe21e26 }), // right
        new THREE.MeshBasicMaterial({ color: 0xe21e26 }), // left
        new THREE.MeshBasicMaterial({ color: 0xe21e26 }), // top
        new THREE.MeshBasicMaterial({ color: 0xe21e26 }), // bottom
        new THREE.MeshBasicMaterial({ color: 0xe21e26 }), // front
        new THREE.MeshBasicMaterial({ color: 0xe21e26 })  // back
    ];
    const cube = new THREE.Mesh(geometry, materials);
    return cube;
}