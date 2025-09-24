import { SceneManager } from './SceneManager.js';
import { CubeManager } from './CubeManager.js';
import { MainPanel } from './ui/MainPanel.js';
import { SidePanel } from './ui/SidePanel.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    
    const sceneManager = new SceneManager(canvas);
    const cubeManager = new CubeManager(sceneManager);
    
    new MainPanel(cubeManager, sceneManager);
    new SidePanel(cubeManager, sceneManager);

    sceneManager.setupMouseControls((deltaX, deltaY) => {
        cubeManager.dragRotate(deltaX, deltaY);
    });
    
    sceneManager.start();
});