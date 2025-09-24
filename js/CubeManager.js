import * as THREE from 'three';
import gsap from 'gsap';

export class CubeManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.cubes = [];
        this.materials = this.createInitialMaterials();
        this.strokes = [];
    }

    createInitialMaterials() {
        const color = 0xe21e26;
        return [
            new THREE.MeshBasicMaterial({ color }), // right
            new THREE.MeshBasicMaterial({ color }), // left
            new THREE.MeshBasicMaterial({ color }), // top
            new THREE.MeshBasicMaterial({ color }), // bottom
            new THREE.MeshBasicMaterial({ color }), // front
            new THREE.MeshBasicMaterial({ color })  // back
        ];
    }

    replicate(rows, cols, gap) {
        const currentRotation = this.cubes.length > 0 ? this.cubes[0].rotation.clone() : new THREE.Euler();
        
        this.cubes.forEach(cube => this.sceneManager.remove(cube));
        this.cubes = [];
        this.strokes = [];

        const cubeSize = 10;
        const step = cubeSize + gap;
        const totalWidth = (cols - 1) * step;
        const totalHeight = (rows - 1) * step;
        const startX = -totalWidth / 2;
        const startY = -totalHeight / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const newCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), this.materials.map(m => m.clone()));
                newCube.position.set(startX + c * step, startY + r * step, 0);
                newCube.rotation.copy(currentRotation);
                this.cubes.push(newCube);
                this.sceneManager.add(newCube);
                this.strokes.push(this.createStrokeForCube(newCube));
            }
        }
        this.sceneManager.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    createStrokeForCube(cube) {
        const edges = new THREE.EdgesGeometry(cube.geometry);
        const lineMat = new THREE.LineBasicMaterial({ color: this.sceneManager.scene.background });
        const lineSegments = new THREE.LineSegments(edges, lineMat);
        cube.add(lineSegments);
        return lineSegments;
    }

    applyRotation(rotation, isAbsolute = false) {
        if (this.cubes.length === 0) return;
        const duration = 0.5;
        const ease = 'power4.inOut';

        const targetRotation = {
            x: isAbsolute ? rotation.x : this.cubes[0].rotation.x + (rotation.x || 0),
            y: isAbsolute ? rotation.y : this.cubes[0].rotation.y + (rotation.y || 0),
            z: isAbsolute ? rotation.z : this.cubes[0].rotation.z + (rotation.z || 0),
        };

        this.cubes.forEach(cube => {
            gsap.to(cube.rotation, { ...targetRotation, duration, ease });
        });
    }

    dragRotate(deltaX, deltaY) {
        this.cubes.forEach(cube => {
            cube.rotation.y += deltaX * 0.01;
            cube.rotation.x += deltaY * 0.01;
        });
    }

    updateFaceMaterial(faceIndex, material) {
        this.materials[faceIndex] = material;
        this.cubes.forEach(cube => {
            cube.material[faceIndex] = material.clone();
            cube.material[faceIndex].needsUpdate = true;
        });
    }

    getFaceNormals() {
        return [
            new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
        ];
    }

    getFaceNames() {
        return ['right', 'left', 'top', 'bottom', 'front', 'back'];
    }

    getVisibleFaces() {
        if (this.cubes.length === 0) return [];
        
        const cameraDirection = new THREE.Vector3();
        this.sceneManager.camera.getWorldDirection(cameraDirection).negate();
        
        const visibleFaceNames = [];
        const faceNormals = this.getFaceNormals();
        const faceNames = this.getFaceNames();

        for (let i = 0; i < faceNormals.length; i++) {
            const normal = faceNormals[i].clone();
            normal.applyQuaternion(this.cubes[0].quaternion);
            if (normal.dot(cameraDirection) > 0.001) {
                visibleFaceNames.push(faceNames[i]);
            }
        }
        return visibleFaceNames;
    }
}
