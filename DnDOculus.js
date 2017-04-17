import 'https://cdn.rodin.io/v0.0.1/vendor/three/examples/js/loaders/OBJLoader.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {OculusController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/OculusController.js';
import {DragAndDrop} from './DragAndDrop.js';

let oculusController = new OculusController();

oculusController.onKeyDown = DragAndDrop.OculusControllerKeyDown;
oculusController.onKeyUp = DragAndDrop.OculusControllerKeyUp;

oculusController.onControllerUpdate = DragAndDrop.objectUpdate;

SceneManager.addController(oculusController);
export {
    oculusController
}
