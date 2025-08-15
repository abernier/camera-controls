import { beforeEach, expect, test } from 'vitest';
import { CameraControls } from './CameraControls';

import * as THREE from 'three';

const subsetOfTHREE = {
	Vector2: THREE.Vector2,
	Vector3: THREE.Vector3,
	Vector4: THREE.Vector4,
	Quaternion: THREE.Quaternion,
	Matrix4: THREE.Matrix4,
	Spherical: THREE.Spherical,
	Box3: THREE.Box3,
	Sphere: THREE.Sphere,
	Raycaster: THREE.Raycaster,
};
CameraControls.install( { THREE: subsetOfTHREE } );

let controls: CameraControls;
let camera: THREE.PerspectiveCamera;
let domElement: HTMLDivElement;

function createControls() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	domElement = document.createElement( 'div' );

	return new CameraControls( camera, domElement );

}

beforeEach( () => {

	controls = createControls();

} );

test( 'CameraControls can be constructed', () => {

	expect( controls ).toBeInstanceOf( CameraControls );

} );

test( 'setLookat', () => {

	controls.setLookAt( 0, 0, 1, 0, 0, 0, false );

	const position = controls.getPosition( new THREE.Vector3() );
	expect( position.x ).toBeCloseTo( 0 );
	expect( position.y ).toBeCloseTo( 0 );
	expect( position.z ).toBeCloseTo( 1 );

	const target = controls.getTarget( new THREE.Vector3() );
	expect( target.x ).toBeCloseTo( 0 );
	expect( target.y ).toBeCloseTo( 0 );
	expect( target.z ).toBeCloseTo( 0 );

} );

test( 'toJSON and fromJSON roundtrip', () => {

	const controls1 = createControls();

	// Set up a specific camera params
	controls1.enabled = true;
	controls1.minDistance = 1;
	controls1.maxDistance = 100;
	controls1.minZoom = 0.1;
	controls1.maxZoom = 10;
	controls1.minPolarAngle = 0.1;
	controls1.maxPolarAngle = Math.PI - 0.1;
	controls1.minAzimuthAngle = - Math.PI;
	controls1.maxAzimuthAngle = Math.PI;
	controls1.smoothTime = 0.25;
	controls1.draggingSmoothTime = 0.125;
	controls1.dollySpeed = 1.5;
	controls1.truckSpeed = 2.0;
	controls1.dollyToCursor = true;

	// make a move
	controls1.setLookAt( 5, 3, 7, 2, 1, 0, false );
	controls1.zoomTo( 2.5, false );
	controls1.setFocalOffset( 0.1, 0.2, 0.3, false );

	// Store original state for comparison
	const position1 = controls1.getPosition( new THREE.Vector3() );
	const target1 = controls1.getTarget( new THREE.Vector3() );
	const zoom1 = controls1.camera.zoom;

	// Export to JSON
	const jsonStr1 = controls1.toJSON();

	// Verify JSON is valid
	expect( jsonStr1 ).toBeDefined();
	expect( typeof jsonStr1 ).toBe( 'string' );

	// Parse JSON to verify structure
	const state1 = JSON.parse( jsonStr1 );
	expect( state1 ).toHaveProperty( 'enabled' );
	expect( state1 ).toHaveProperty( 'target' );
	expect( state1 ).toHaveProperty( 'position' );
	expect( state1 ).toHaveProperty( 'spherical' );
	expect( state1 ).toHaveProperty( 'zoom' );
	expect( state1 ).toHaveProperty( 'focalOffset' );

	// Create a new controls instance to test fromJSON
	const controls2 = createControls();

	// Import the JSON state (without transition)
	controls2.fromJSON( jsonStr1, false );

	// Verify that all properties are correctly restored
	expect( controls2.enabled ).toBe( controls1.enabled );
	expect( controls2.minDistance ).toBe( controls1.minDistance );
	expect( controls2.maxDistance ).toBe( controls1.maxDistance );
	expect( controls2.minZoom ).toBe( controls1.minZoom );
	expect( controls2.maxZoom ).toBe( controls1.maxZoom );
	expect( controls2.minPolarAngle ).toBe( controls1.minPolarAngle );
	expect( controls2.maxPolarAngle ).toBe( controls1.maxPolarAngle );
	expect( controls2.minAzimuthAngle ).toBe( controls1.minAzimuthAngle );
	expect( controls2.maxAzimuthAngle ).toBe( controls1.maxAzimuthAngle );
	expect( controls2.smoothTime ).toBe( controls1.smoothTime );
	expect( controls2.draggingSmoothTime ).toBe( controls1.draggingSmoothTime );
	expect( controls2.dollySpeed ).toBe( controls1.dollySpeed );
	expect( controls2.truckSpeed ).toBe( controls1.truckSpeed );
	expect( controls2.dollyToCursor ).toBe( controls1.dollyToCursor );

	// Verify camera position and target are correctly restored
	const position2 = controls2.getPosition( new THREE.Vector3() );
	const target2 = controls2.getTarget( new THREE.Vector3() );

	expect( position2.x ).toBeCloseTo( position1.x );
	expect( position2.y ).toBeCloseTo( position1.y );
	expect( position2.z ).toBeCloseTo( position1.z );

	expect( target2.x ).toBeCloseTo( target1.x );
	expect( target2.y ).toBeCloseTo( target1.y );
	expect( target2.z ).toBeCloseTo( target1.z );

	expect( controls2.camera.zoom ).toBeCloseTo( zoom1 );

	//
	// Test roundtrip: export again and compare
	//

	const jsonStr2 = controls2.toJSON();
	const state2 = JSON.parse( jsonStr2 );

	// Compare key properties to ensure they're identical after roundtrip
	expect( state2.enabled ).toBe( state1.enabled );
	expect( state2.target ).toEqual( state1.target );
	expect( state2.zoom ).toBeCloseTo( state1.zoom );
	expect( state2.spherical ).toEqual( state1.spherical );
	expect( state2.focalOffset ).toEqual( state1.focalOffset );

} );


