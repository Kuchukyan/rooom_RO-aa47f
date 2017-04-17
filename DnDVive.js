import * as RODIN from 'https://cdn.rodin.io/v0.0.1/rodinjs/RODIN.js';
import 'https://cdn.rodin.io/v0.0.1/vendor/three/examples/js/loaders/OBJLoader.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {ViveController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/ViveController.js';
import {DragAndDrop} from './DragAndDrop.js';

const scene = SceneManager.get();
let controls = scene.controls;

let controllerL = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.LEFT, scene, scene.camera, 1);
controllerL.standingMatrix = controls.getStandingMatrix();
controllerL.initControllerModel();
controllerL.initRaycastingLine();

controllerL.onKeyDown = DragAndDrop.ViveControllerKeyDown;
controllerL.onKeyUp   = DragAndDrop.ViveControllerKeyUp;

SceneManager.addController(controllerL);
scene.add(controllerL);

let controllerR = new ViveController(RODIN.CONSTANTS.CONTROLLER_HANDS.RIGHT, scene, scene.camera, 1);
controllerR.standingMatrix = controls.getStandingMatrix();
controllerR.initControllerModel();
controllerR.initRaycastingLine();

controllerR.onKeyDown = DragAndDrop.ViveControllerKeyDown;
controllerR.onKeyUp   = DragAndDrop.ViveControllerKeyUp;

SceneManager.addController(controllerR);
scene.add(controllerR);

controllerL.onControllerUpdate = DragAndDrop.objectUpdate;
controllerR.onControllerUpdate = DragAndDrop.objectUpdate;
export {
    controllerL,
    controllerR
}
