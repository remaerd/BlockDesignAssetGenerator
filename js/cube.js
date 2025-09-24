import * as THREE from 'three';

export function createCube() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    // Order: right, left, top, bottom, front, back
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x00ffff }), // right
        new THREE.MeshBasicMaterial({ color: 0xff00ff }), // left
        new THREE.MeshBasicMaterial({ color: 0x0000ff }), // top
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // front
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })  // back
    ];
    const cube = new THREE.Mesh(geometry, materials);
    return cube;
}