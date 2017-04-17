import 'https://cdn.rodin.io/v0.0.1/vendor/three/examples/js/loaders/OBJLoader.js';

import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager.js';
import {CardboardController} from 'https://cdn.rodin.io/v0.0.1/rodinjs/controllers/CardboardController.js';
import {DragAndDrop} from './DragAndDrop.js';


let cardboardController = new CardboardController();

cardboardController.onKeyDown = DragAndDrop.CardboardControllerKeyDown;
cardboardController.onKeyUp = DragAndDrop.CardboardControllerKeyUp;

cardboardController.onControllerUpdate = DragAndDrop.objectUpdate;

SceneManager.addController(cardboardController);
export {
    cardboardController
}
