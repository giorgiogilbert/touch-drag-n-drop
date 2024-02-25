import {test, assert } from 'vitest';
import {JSDOM} from 'jsdom';
import touchDragNDrop from '../index.js';

const {window} = new JSDOM();

test('Callback registration and removal works', () => {
    const document = window.document;
    const config = {draggableSelector: '.draggable', droppableSelector: '.droppable'};
    const dragDropHandler = touchDragNDrop.init(document, config);

    let callbackExecuted = false;

    // Test callback registration
    const callbackId = dragDropHandler.onDrop( (a,b,e) => {
        callbackExecuted = true;
    });
    assert.isNotNull(dragDropHandler.callbacks['drop'][callbackId], 'Callback should be registered');

    dragDropHandler.drop({}, {}, {});
    assert.isTrue(callbackExecuted, 'Callback should be executed');

    callbackExecuted = false;

    // Test callback removal
    dragDropHandler.removeDropCallback(callbackId);
    assert.isUndefined(dragDropHandler.callbacks['drop'][callbackId], 'Callback should be removed');

    dragDropHandler.drop({}, {}, {});
    assert.isFalse(callbackExecuted, 'Callback should not be executed');

});
