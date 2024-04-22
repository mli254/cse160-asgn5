import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
    canvas.width = 500;
    canvas.height = 500;
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

    // Setting up Camera
	const fov = 75;
	const aspect = 1; // the canvas default
	const near = 0.1;
	const far = 10;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 5;

	const scene = new THREE.Scene(); // root of screen graph
    scene.background = new THREE.Color( 0x4c7857 );

    // Setting up Lighting
    {
        const color = 0xFFFFFF;
        const intensity = 5;
        const light = new THREE.DirectionalLight( color, intensity );
        light.position.set( - 1, 2, 4 );
        scene.add( light );
    }

    // Adding a model
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('./models/little_fox/materials.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        
            objLoader.load('./models/little_fox/model.obj', (root) => {
                root.rotation.y = 1;
                scene.add(root);
        });
    });
    // Cube Geometry Settings
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const cubeGeometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

    // Cylinder Geometry Settings
    const radiusTop = 1;
    const radiusBottom = 1;
    const cylinderHeight = 1;
    const radialSegments = 12;
    const cylinderGeometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, cylinderHeight, radialSegments );

    const coneRadius = 1;
    const coneHeight = 1;
    const coneSegments = 16;
    const coneGeometry = new THREE.ConeGeometry( coneRadius, coneHeight, coneSegments);

    // Textures Settings
    const loader = new THREE.TextureLoader();
	const texture = loader.load( './images/miku.png' );
	texture.colorSpace = THREE.SRGBColorSpace;

    const objects = [];

    // Create Color Material
    function createColorMaterial(color) {
        const material = new THREE.MeshPhongMaterial( { color } );
        return material;
    }

    // Create Texture Material
    function createTexturedMaterial(texture) {
        const material = new THREE.MeshPhongMaterial( {
            map: texture
        } );
        return material;
    }

    // Draw Objects
    function addObject( x, y, obj ) {

		obj.position.x = x;
		obj.position.y = y;

		scene.add( obj );
		objects.push( obj );
        return obj;

    }

    // Abstracted method for creating geometries
    function addSolidGeometry( x, y, geometry, material ) {

		const mesh = new THREE.Mesh( geometry, material );
		return addObject( x, y, mesh );

	}

    addSolidGeometry(-2, 0, cubeGeometry, createColorMaterial(0x8844aa));
    addSolidGeometry(2, 0, cylinderGeometry, createColorMaterial(0xaa8844));
    addSolidGeometry(0, 2, coneGeometry, createTexturedMaterial(texture));
    addSolidGeometry(0, -2, cubeGeometry, createTexturedMaterial(texture));

    // Animation
	function render( time ) {

		time *= 0.001; // convert time to seconds

		objects.forEach( ( obj, ndx ) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			obj.rotation.x = rot;
			obj.rotation.y = rot;

		} );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
}

main();