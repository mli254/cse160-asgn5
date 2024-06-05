import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {Star} from './star.js';

function main() {

    // #region Setup
	const canvas = document.querySelector( '#c' );
    canvas.width = 500;
    canvas.height = 500;
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

    // Setting up Camera
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set(0, -0.5, -5);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

	const scene = new THREE.Scene(); // root of screen graph
    scene.background = new THREE.Color( 0x4c7857 );

    // Setting up a CubeMap
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './images/sky_right.png',
            './images/sky_left.png',
            './images/sky_top.png',
            './images/sky_bottom.png',
            './images/sky_front.png',
            './images/sky_back.png'
        ]);
        scene.background = texture;
    }
    // #endregion

    // #region Snow
    // Setting up Snow Effect
    // Following tutorial: https://www.youtube.com/watch?v=OXpl8durSjA
    let particles; // snowflakes
    let positions = []; // positions(x, y, z)
    let velocities = []; // velocities(x, y, z)

    const numSnowflakes = 10000 // number of snowflakes 

    const maxRange = 1000, minRange = maxRange/2; // places snoeflakes on the x & z axes from -500 to 500
    const minHeight = 150; // snowflakes placed from 150->500 on y axis

    // BufferGeometry stores data as an array with individual attributes (position, color, size, faces, etc.)
    const bufferGeometry = new THREE.BufferGeometry();
    const loader = new THREE.TextureLoader();

    addSnowflakes();

    function addSnowflakes() {
        // 1) Create Snowflake Geometry
        for (let i=0; i<numSnowflakes; i++) {
            positions.push(
                Math.floor(Math.random() * maxRange - minRange), // x -> -500 to 500
                Math.floor(Math.random() * minRange - minHeight), // y -> 250 to 750
                Math.floor(Math.random() * maxRange - minRange) // z -> -500 to 500
            ); 

            velocities.push(
                Math.floor(Math.random() * 6 - 3) * 0.1, // x -0.3 to 0.3
                Math.floor(Math.random() * 5 + 0.12) * 0.18, // y 0.02 to 0.92
                Math.floor(Math.random() * 6 - 3) * 0.1 // z -0.3 to 0.3
            );
        }

        // Each attribute has an array of values
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        bufferGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

        // 2) Create Snowflake Material
        const snowflakeMaterial = new THREE.PointsMaterial({
            size: 4,
            map: loader.load("./images/snowflake.png"),
            blending: THREE.AdditiveBlending, // add RGB values when combining 2 colors, makes the snowflakes brighter
            depthTest: false, // determines if one object is in front of another
            transparent: true, // enable opacity changes to work
            opacity: 0.3,
        });

        particles = new THREE.Points(bufferGeometry, snowflakeMaterial);
        scene.add(particles);
    }

    function updateParticles() {
        for (let i=0; i<numSnowflakes*3; i+=3) {
            // Alter x, y, z position of each snowflake by its respective x, y, z velocity
            // change x position by x velocity
            particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
            // change y position by x velocity
            particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1];
            // change z position by x velocity
            particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2];
    
            // Pool the snowflakes by resetting their starting position when they hit the ground
            if (particles.geometry.attributes.position.array[i+1] < -150) {
                particles.geometry.attributes.position.array[i] = Math.floor(Math.random()*maxRange-minRange); // x
                particles.geometry.attributes.position.array[i+1] = Math.floor(Math.random()*minRange-minHeight); // y
                particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random()*maxRange-minRange); // z
            }
        }
    
        // when attribute changed, needs to be resent to GPU to upsate position array of particles
        particles.geometry.attributes.position.needsUpdate=true;
    }
    // #endregion

    // #region Stars
    const star = new Star();
    scene.add(star.object);
    scene.add(star.light);
    scene.add(star.light.target);
    scene.add(star.helper);
    // #endregion

    // #region Lighting
    // Ambient Light
    {
        const color = 0x163751;
        const intensity = 10;
        const light = new THREE.AmbientLight( color, intensity ); // soft white light
        scene.add( light );
    }

    // Point Light
    {
        const color = 0x00ffff;
        const intensity = 15;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 5, 0);
        scene.add(light);

        const helper = new THREE.PointLightHelper(light);
        scene.add(helper);
    }

    // Spot Light
    {
        // const color = 0xFFFFFF;
        // const intensity = 250;
        // const angle = THREE.MathUtils.radToDeg(30);
        // const penumbra = 0.5;
        // const light = new THREE.SpotLight(color, intensity, 0, angle, penumbra);
        // light.position.set(5, -4, 2);
        // light.target.position.set(-5, 0, 0);
        // scene.add(light);
        // scene.add(light.target);

        // const helper = new THREE.SpotLightHelper(light);
        // scene.add(helper);
    }
    // #endregion

    // #region Models
    // Fox Model
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    const gltfLoader = new GLTFLoader();

    gltfLoader.load( './models/ground.glb', function (gltf) {
        const groundModel = gltf.scene;
        groundModel.position.y = -1.7;
        scene.add( groundModel );
    }, undefined, function (error) {
        console.error( error );
    });

    gltfLoader.load('./models/pond.glb', function (gltf) {
        const pondModel = gltf.scene;
        pondModel.position.x = 3;
        pondModel.position.y = -0.5;
        pondModel.position.z = -2;
        scene.add( pondModel );

    }, undefined, function (error) {
        console.error( error );
    });

    mtlLoader.load('./models/pond/PUSHILIN_pond.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        
            objLoader.load('./models/pond/PUSHILIN_pond.obj', (pond) => {
                pond.position.x = -3;
                scene.add(pond);
        });
    });

    mtlLoader.load('./models/little_fox/materials.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        
            objLoader.load('./models/little_fox/model.obj', (root) => {
                root.rotation.y = 1;
                scene.add(root);
        });
    });
    // #endregion

    // #region Geometry Settings
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

    // Cone Geometry Settings
    const coneRadius = 1;
    const coneHeight = 1;
    const coneSegments = 16;
    const coneGeometry = new THREE.ConeGeometry( coneRadius, coneHeight, coneSegments);

    // Plane Geometry Settings
    const planeSize = 40;
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);

    // Sphere Geometry Settings
    const sphereRadius = 0.25;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    // #endregion

    // #region Textures
    // Textures Settings
	const mikuTexture = loader.load( './images/miku.png' );
	mikuTexture.colorSpace = THREE.SRGBColorSpace;

    // #region Obj Helper Funcs
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
    // #endregion

    // #region Add Geometries
    const objects = [];

    // Adding Geometries 
    // addSolidGeometry(-2, 0, cubeGeometry, createColorMaterial(0x8844aa));
    // addSolidGeometry(2, 0, cylinderGeometry, createColorMaterial(0xaa8844));
    // addSolidGeometry(0, 2, coneGeometry, createTexturedMaterial(mikuTexture));
    // addSolidGeometry(0, -2, cubeGeometry, createTexturedMaterial(mikuTexture));

    const planeObj = new THREE.Mesh( planeGeometry, createColorMaterial(0x2F9982) );
    planeObj.position.x = 0;
    planeObj.position.y = -1;
    planeObj.rotation.x = Math.PI * -.5;
    // scene.add(planeObj)

    // #region Post-Processing
    // Followed Post-Processing Documentation from Three.js, used the following links to help debug some issues (blurriness):
        // https://www.youtube.com/watch?v=ZtK70Tb9uqg
    // Post Processing
    const composer = new EffectComposer( renderer );

    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.05, 0.2);
    composer.addPass( bloomPass );

    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    // #region Animation
	function render( time ) {
        time *= 0.001; // convert time to seconds

        updateParticles();
		composer.render();
		requestAnimationFrame( render );
	}
	requestAnimationFrame( render );
}

main();