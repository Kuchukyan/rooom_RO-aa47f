import * as RODIN from 'https://cdn.rodin.io/v0.0.1/rodinjs/RODIN.js';
import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {RodinPhysics} from 'https://cdn.rodin.io/v0.0.1/rodinjs/physics/RodinPhysics.js';
import {TWEEN} from 'https://cdn.rodin.io/v0.0.1/rodinjs/Tween.js';
import {CubeObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/CubeObject.js';

import {Lights} from './Lights.js';
import {Import3DModels} from './Import3DModels.js';
import {DragAndDrop} from './DragAndDrop.js';

let scene = SceneManager.get();
let controls = scene.controls;
let renderer = scene.renderer;

renderer.setPixelRatio(window.devicePixelRatio);
scene.setCameraProperty('far', 100);

// add skybox
let skybox = new CubeObject(50, 'models/textures/skybox.jpg');
skybox.on('ready', () => {
    skybox.object3D.position.y = controls.userHeight;
    skybox.object3D.rotation.y = Math.PI;
    scene.add(skybox.object3D);
});

///// physics /////
scene.physics = RodinPhysics.getInstance('oimo');

//Setting up world
scene.physics.setupWorldGeneralParameters(0, -9.8, 0, 8, true, 32);

scene.preRender(() => {
    // Update scene's objects physics.
    scene.physics.updateWorldPhysics(RODIN.Time.deltaTime());
});
