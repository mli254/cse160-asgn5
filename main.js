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
	camera.position.set(0, 0, 5);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

	const scene = new THREE.Scene(); // root of screen graph
    scene.background = new THREE.Color( 0x4c7857 );

    // Setting up a CubeMap
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './images/quarry_cubemap_right.png',
            './images/quarry_cubemap_left.png',
            './images/quarry_cubemap_top.png',
            './images/quarry_cubemap_bottom.png',
            './images/quarry_cubemap_front.png',
            './images/quarry_cubemap_back.png'
        ]);
        scene.background = texture;
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
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    // Point Light
    {
        const color = 0xedc0c1;
        const intensity = 150;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 5, 0);
        scene.add(light);

        const helper = new THREE.PointLightHelper(light);
        scene.add(helper);
    }

    // Spot Light
    {
        const color = 0xFFFFFF;
        const intensity = 250;
        const angle = THREE.MathUtils.radToDeg(30);
        const penumbra = 0.5;
        const light = new THREE.SpotLight(color, intensity, 0, angle, penumbra);
        light.position.set(5, -4, 2);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);

        const helper = new THREE.SpotLightHelper(light);
        scene.add(helper);
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
    const loader = new THREE.TextureLoader();
	const mikuTexture = loader.load( './images/miku.png' );
	mikuTexture.colorSpace = THREE.SRGBColorSpace;

    const objects = [];
    const snowObjects = [];

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

    function addSnow(amount) {
        for (let i = 0; i < amount; i++) {
            const mesh = new THREE.Mesh(sphereGeometry, createColorMaterial(0xffffff));
            mesh.position.x = (i - amount/2)*5;
            mesh.position.y = (Math.random()*10);
            scene.add(mesh);
            snowObjects.push(mesh);
        }
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

    addSnow(20);

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

        snowObjects.forEach( (obj, ndx)  => {
            if (obj.position.y < -10) {
                obj.position.y = 10;
                timePeriod = time;
            } else {
                const speed = 1 + ndx * .001;
                const delta = speed;
                obj.position.y -= delta;
            }
        });

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
}

main();