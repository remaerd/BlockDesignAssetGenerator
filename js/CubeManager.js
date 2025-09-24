import * as THREE from 'three';
import gsap from 'gsap';

export class CubeManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.cubes = [];
        this.materials = this.createInitialMaterials();
        this.strokes = [];
        this.grid = { rows: 1, cols: 1, gap: 2 };
    }

    createInitialMaterials() {
        const color = '#e21e26';

        const textureLoader = new THREE.TextureLoader();
        const frontTexture = textureLoader.load('assets/images/UWE_Web_Avatar_Top-24.png');
        frontTexture.minFilter = THREE.LinearFilter;
        const frontMaterial = new THREE.MeshBasicMaterial({ map: frontTexture });

        const rightCanvas = this.createTextCanvas("University of the West of England", color);
        const rightTexture = new THREE.CanvasTexture(rightCanvas);
        rightTexture.minFilter = THREE.LinearFilter;
        const rightMaterial = new THREE.MeshBasicMaterial({ map: rightTexture });

        const topCanvas = this.createTextCanvas("School of Computing and Creative Technologies", color);
        const topTexture = new THREE.CanvasTexture(topCanvas);
        topTexture.minFilter = THREE.LinearFilter;
        const topMaterial = new THREE.MeshBasicMaterial({ map: topTexture });

        return [
            rightMaterial,           // right
            new THREE.MeshBasicMaterial({ color }), // left
            topMaterial,             // top
            new THREE.MeshBasicMaterial({ color }), // bottom
            frontMaterial,           // front
            new THREE.MeshBasicMaterial({ color })  // back
        ];
    }

    replicate(rows, cols) {
        this.grid.rows = rows;
        this.grid.cols = cols;

        const currentRotation = this.cubes.length > 0 ? this.cubes[0].rotation.clone() : new THREE.Euler();
        
        this.cubes.forEach(cube => this.sceneManager.remove(cube));
        this.cubes = [];
        this.strokes = [];

        const cubeSize = 10;

        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const newCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), this.materials.map(m => m.clone()));
                newCube.rotation.copy(currentRotation);
                this.cubes.push(newCube);
                this.sceneManager.add(newCube);
                this.strokes.push(this.createStrokeForCube(newCube));
            }
        }
        this.updateLayout(this.grid.gap, 0); // Update layout without animation
    }

    updateLayout(gap, duration = 0.5) {
        this.grid.gap = gap;
        const { rows, cols } = this.grid;

        const cubeSize = 10;
        const step = cubeSize + gap;
        const totalWidth = (cols - 1) * step;
        const totalHeight = (rows - 1) * step;
        const startX = -totalWidth / 2;
        const startY = -totalHeight / 2;

        this.cubes.forEach((cube, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            const targetPosition = {
                x: startX + c * step,
                y: startY + r * step,
                z: 0
            };

            if (duration > 0) {
                gsap.to(cube.position, {
                    ...targetPosition,
                    duration: duration,
                    ease: 'power2.out'
                });
            } else {
                cube.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            }
        });

        if (duration > 0) {
            gsap.to({}, { 
                duration, 
                onUpdate: () => this.sceneManager.camera.lookAt(new THREE.Vector3(0, 0, 0)) 
            });
        } else {
            this.sceneManager.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
    }

    getContrastingTextColor(hex) {
        if (hex.startsWith('#')) hex = hex.slice(1);
        const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    createTextCanvas(content, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');

        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.getContrastingTextColor(color);
        context.font = '48pt parisine-std';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        if (content.trim() !== '') {
            const padding = 40, lineHeight = 64, x = padding, maxWidth = canvas.width - (padding * 2);
            let line = '', y = padding;
            const words = content.split(' ');
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (context.measureText(testLine).width > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
        }
        return canvas;
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
