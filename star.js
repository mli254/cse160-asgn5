import * as THREE from 'three';

export class Star {
    constructor(x = -5, y = 8, z = 10, color=0xA9FFFB) {
        this.size = 3;

        this.bufferGeometry = new THREE.BufferGeometry();
        this.vertices = new Float32Array( [
            x, y, z
        ] );
        this.bufferGeometry.setAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );

        this.loader = new THREE.TextureLoader();
        this.starMaterial = new THREE.PointsMaterial({
            size: this.size,
            map: this.loader.load("./images/big_star.png"),
            blending: THREE.AdditiveBlending, // add RGB values when combining 2 colors, makes the snowflakes brighter
            depthTest: false, // determines if one object is in front of another
            transparent: true, // enable opacity changes to work
            opacity: 1,
        });

        this.object = new THREE.Points(this.bufferGeometry, this.starMaterial);

        // Adding a light where the star is
        this.color = color;
        this.intensity = 1.5;
        this.light = new THREE.DirectionalLight( this.color, this.intensity );
        this.light.position.set(x, y, z);
        this.light.target.position.set(0, 0, 0);
        this.helper = new THREE.DirectionalLightHelper(this.light);
    }

    twinkleStar() {
        this.object.scale()
    }
}