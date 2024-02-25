'use strict';
const matrix = require('./matrix.js');
exports.init = function (document, config) {
    if (
        typeof document !== 'object'
        || typeof document.querySelector !== 'function'
        || typeof document.querySelectorAll !== 'function'
        || typeof document.addEventListener !== 'function'
    ) {
        throw new Error('Invalid document object provided');
    }
    if(
        typeof config !== 'object'
        || typeof config.draggableSelector !== 'string'
        || config.draggableSelector === ''
    ) {
        throw new Error('Invalid config object: provide a draggableSelector');
    }
    if(typeof config.droppableSelector !== 'string'
        || config.droppableSelector === ''
    ) {
        throw new Error('Invalid config object: provide a droppableSelector');
    }
    this.document = document;
    this.config = config;
    resetDragState(this);
    initEventListeners( this );
    const supportedEvents = [
        'drop',
        'dragstart',
        'dragend',
        'dragenter',
        'dragleave'
    ];
    this.callbacks = {};
    for(const eventName of supportedEvents) {
        this.callbacks[eventName] = {};
    }
    this.on = function ( eventName, callback ) {
        if(!this.callbacks[eventName]) {
            throw new Error(`Event ${eventName} not supported`);
        }
        let callbackId = Math.random().toString(36).substring(2) + Date.now();
        this.callbacks[eventName][callbackId] = callback;
        return callbackId;
    }
    this.removeCallback = function ( eventName, callbackId ) {
        if(!this.callbacks[eventName]) {
            throw new Error(`Event ${eventName} not supported`);
        }
        delete this.callbacks[eventName][callbackId];
    }
    this.runCallbacks = function ( eventName, event, dropElement ) {
        if(!this.callbacks[eventName]) {
            throw new Error(`Event ${eventName} not supported`);
        }
        for(const callback of Object.values(this.callbacks[eventName])) {
            if( ['drop', 'dragenter', 'dragleave'].includes(eventName) ) {
                callback(this.dragElement, dropElement, event );
            } else {
                callback(this.dragElement, event );
            }
        }
    }

    this.onDrop = function ( callback ) {
        return this.on('drop', callback);
    }
    this.removeDropCallback = function ( callbackId ) {
        this.removeCallback('drop', callbackId);
    }
    this.onDragStart = function ( callback ) {
        return this.on('dragstart', callback);
    }
    this.removeDragStartCallback = function ( callbackId ) {
        this.removeCallback('dragstart', callbackId);
    }
    this.onDragEnd = function ( callback ) {
        return this.on('dragend', callback);
    }
    this.removeDragEndCallback = function ( callbackId ) {
        this.removeCallback('dragend', callbackId);
    }
    this.onDragEnter = function ( callback ) {
        return this.on('dragenter', callback);
    }
    this.removeDragEnterCallback = function ( callbackId ) {
        this.removeCallback('dragenter', callbackId);
    }
    this.onDragLeave = function ( callback ) {
        return this.on('dragleave', callback);
    }
    this.removeDragLeaveCallback = function ( callbackId ) {
        this.removeCallback('dragleave', callbackId);
    }

    this.drop = function ( dropElement, event ) {
        this.runCallbacks('drop', event, dropElement);
    }
    this.dragStart = function ( event ) {
        this.runCallbacks('dragstart', event);
    }
    this.dragEnd = function ( event ) {
        this.runCallbacks('dragend', event);
    }
    this.dragEnter = function ( dropElement, event ) {
        this.runCallbacks('dragenter', event, dropElement);
    }
    this.dragLeave = function ( dropElement, event ) {
        this.runCallbacks('dragleave', event, dropElement);
    }


    return this;
};
const resetDragState = function ( handler ) {
    if( handler.dragElement ) {
        handler.dragElement.style.transform = matrix.matrixToCss(handler.dragElementMatrix, 0, 0);
    }
    handler.dragElement = null;
    handler.dragStartX = null;
    handler.dragStartY = null;
    handler.dragElementMatrix = null;
    handler.dragDeltaX = null;
    handler.dragDeltaY = null;
}
const initEventListeners = function ( handler ) {
    handler.document.addEventListener('touchstart', event => {
        event.preventDefault();
        const node = event.target
        if(!node.matches(handler.config.draggableSelector)) {
            resetDragState(handler);
            return;
        }
        handler.dragElement = node;
        handler.dragStartX = event.touches[0].clientX;
        handler.dragStartY = event.touches[0].clientY;

        // this is needed in order to keep track of already applied transformation
        // and mantain them while the item is dragged
        handler.dragElementMatrix = matrix.getMatrix(node, window);

        handler.dragStart(event);
    }, {passive: false});
    handler.document.addEventListener('touchmove', event => {
        event.preventDefault();
        if(!handler.dragElement) return;
        handler.dragDeltaX = event.touches[0].clientX - handler.dragStartX;
        handler.dragDeltaY = event.touches[0].clientY - handler.dragStartY;

        handler.dragElement.style.transform = matrix.matrixToCss( matrix.add2dTranslation(handler.dragElementMatrix, handler.dragDeltaX, handler.dragDeltaY) );

        let allDropTargets = handler.document.querySelectorAll(handler.config.droppableSelector);
        let matchedDropTarget = findMatchedDropTarget(handler, event);
        for (const dropTarget of allDropTargets) {
            if( dropTarget !== matchedDropTarget && dropTarget.getAttribute('data-touchDragOver') ) {
                handler.dragLeave(dropTarget, event);
            }
        }
        if(matchedDropTarget) {
            matchedDropTarget.setAttribute('data-touchDragOver', true);
            handler.dragEnter(matchedDropTarget, event);
        }
    }, {passive: false});
    handler.document.addEventListener('touchend', event => {
        event.preventDefault();
        const dropTarget = findMatchedDropTarget(handler, event);
        if( dropTarget ) {
            handler.drop(dropTarget, event);
        }
        handler.dragEnd(event);
        resetDragState(handler);
    }, {passive: false});
}
const findMatchedDropTarget = function ( handler, event ) {
    const allDropTargets = handler.document.querySelectorAll(handler.config.droppableSelector);
    const matchedDropTarget = Array.from(allDropTargets).find(
        dropTarget => {
            const rect = dropTarget.getBoundingClientRect();
            return (
                event.changedTouches[0].clientX > rect.left
                && event.changedTouches[0].clientX < rect.right
                && event.changedTouches[0].clientY > rect.top
                && event.changedTouches[0].clientY < rect.bottom
            );
        }
    )
    return matchedDropTarget || null;
}

