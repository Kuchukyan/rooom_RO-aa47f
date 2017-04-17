import 'https://cdn.rodin.io/v0.0.1/vendor/three/examples/js/loaders/OBJLoader.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {MouseController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/MouseController';
import {DragAndDrop} from './DragAndDrop.js';

let mouseController = new MouseController();

mouseController.onControllerUpdate = DragAndDrop.objectUpdate;

SceneManager.addController(mouseController);
export {
    mouseController
}