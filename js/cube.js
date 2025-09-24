import * as THREE from 'three';

export function createCube() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff }),
        new THREE.MeshBasicMaterial({ color: 0xff00ff })
    ];
    const cube = new THREE.Mesh(geometry, materials);
    return cube;
}