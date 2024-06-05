import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function main() {

	const canvas = document.querySelector( '#c' );
    canvas.width = 500;
    canvas.height = 500;
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

    // Setting up Camera
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set(0, 0, -5);

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

    // Setting up Snow Effect
    // Following tutorial: https://www.youtube.com/watch?v=OXpl8durSjA
    let particles; // snowflakes
    let positions = []; // positions(x, y, z)
    let velocities = []; // velocities(x, y, z)

    const numSnowflakes = 15000 // number of snowflakes 

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
            opacity: 0.9,
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

    // Setting up Directional Lighting
    {
        const color = 0xc0d1ed;
        const intensity = 5;
        const light = new THREE.DirectionalLight( color, intensity );
        light.position.set(-2, -4, 2);
        light.target.position.set(5, 0, 0);
        scene.add(light);
        scene.add(light.target);

        const helper = new THREE.DirectionalLightHelper(light);
        scene.add(helper);
    }

    // Hemisphere Light
    {
        // const skyColor = 0xB1E1FF;  // light blue
        // const groundColor = 0xB97A20;  // brownish orange
        // const intensity = 1;
        // const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        // scene.add(light);
    }

    // Point Light
    {
        const color = 0xedc0c1;
        // const intensity = 150;
        // const light = new THREE.PointLight(color, intensity);
        // light.position.set(0, 5, 0);
        // scene.add(light);

        // const helper = new THREE.PointLightHelper(light);
        // scene.add(helper);
    }

    // Spot Light
    {
    //     const color = 0xFFFFFF;
    //     const intensity = 250;
    //     const angle = THREE.MathUtils.radToDeg(30);
    //     const penumbra = 0.5;
    //     const light = new THREE.SpotLight(color, intensity, 0, angle, penumbra);
    //     light.position.set(5, -4, 2);
    //     light.target.position.set(-5, 0, 0);
    //     scene.add(light);
    //     scene.add(light.target);

    //     const helper = new THREE.SpotLightHelper(light);
    //     scene.add(helper);
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


    // Textures Settings
	const mikuTexture = loader.load( './images/miku.png' );
	mikuTexture.colorSpace = THREE.SRGBColorSpace;

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
    addSolidGeometry(0, 2, coneGeometry, createTexturedMaterial(mikuTexture));
    addSolidGeometry(0, -2, cubeGeometry, createTexturedMaterial(mikuTexture));
    const planeObj = new THREE.Mesh( planeGeometry, createTexturedMaterial(mikuTexture) );
    planeObj.position.x = 0;
    planeObj.position.y = -10;
    planeObj.rotation.x = Math.PI * -.5;
    scene.add(planeObj)

    const sphereObj = new THREE.Mesh(sphereGeometry, createColorMaterial(0xffffff));
    sphereObj.position.x = 0;
    sphereObj.position.y = -7;
    scene.add(sphereObj);

    // Animation
	function render( time ) {
        time *= 0.001; // convert time to seconds
        let timePeriod = 5;

		// objects.forEach( ( obj, ndx ) => {

		// 	const speed = 1 + ndx * .1;
		// 	const rot = time * speed;
		// 	obj.rotation.x = rot;
		// 	obj.rotation.y = rot;

		// } );

        // controls.update();
        updateParticles();
		renderer.render( scene, camera );
		requestAnimationFrame( render );
	}
	requestAnimationFrame( render );
}

main();