# Three.js Isometric Cube

This project is a static website that utilizes Three.js to create a customizable 3D cube. Users can replace each surface of the cube with text, images, or videos. The cube is rendered in an isometric camera angle without any light reflection, providing a flat appearance.

## Project Structure

```
threejs-isometric-cube
├── index.html          # Main HTML document
├── css
│   └── style.css      # Styles for the website
├── js
│   ├── main.js        # Entry point for JavaScript code
│   ├── scene.js       # Manages the Three.js scene setup
│   └── cube.js        # Defines the Cube class and its functionalities
├── assets
│   ├── images         # Directory for image files
│   └── videos         # Directory for video files
└── README.md          # Project documentation
```

## Features

- **Customizable Cube Surfaces**: Replace each face of the cube with text, images, or videos.
- **Isometric View**: The cube is rendered in an isometric camera angle for a unique perspective.
- **Flat Rendering**: The cube is displayed without light reflection, ensuring a clean look.
- **Export Functionality**: Users can export the current view of the cube as images or videos and download them.

## Setup Instructions

1. Clone the repository to your local machine.
2. Open `index.html` in a web browser to view the project.
3. Customize the cube surfaces using the provided JavaScript functionality.

## Usage Guidelines

- To add images or videos, place your files in the `assets/images` or `assets/videos` directories respectively.
- Modify the JavaScript files in the `js` directory to change the cube's behavior and appearance as needed.

## Acknowledgments

This project utilizes Three.js for 3D rendering and is inspired by various web-based 3D applications.