(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.touchDragNDrop = require('../index.js');

},{"../index.js":2}],2:[function(require,module,exports){
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
        const node = event.target
        if(!node.matches(handler.config.draggableSelector)) {
            resetDragState(handler);
            return;
        }
        event.preventDefault();
        handler.dragElement = node;
        handler.dragStartX = event.touches[0].clientX;
        handler.dragStartY = event.touches[0].clientY;

        // this is needed in order to keep track of already applied transformation
        // and mantain them while the item is dragged
        handler.dragElementMatrix = matrix.getMatrix(node, window);

        handler.dragStart(event);
    }, {passive: false});
    handler.document.addEventListener('touchmove', event => {
        if(!handler.dragElement) return;
        event.preventDefault();
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
        if (!handler.dragElement) return;
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


},{"./matrix.js":3}],3:[function(require,module,exports){
exports.getMatrix = function( node, window ) {

    let transformMatrix = window.getComputedStyle(node).transform;
    let type = '2d';
    let value = [1, 0, 0, 1, 0, 0];
    if(transformMatrix && transformMatrix!=='none') {
        if (transformMatrix.startsWith('matrix3d')) {
            type = '3d';
            value = transformMatrix.replace('matrix3d(', '').replace(')', '').split(',').map(x => parseFloat(x));
        } else if (transformMatrix.startsWith('matrix(')) {
            value = transformMatrix.replace('matrix(', '').replace(')', '').split(',').map(x => parseFloat(x));
        } else {
            // To implement
            // convert CSS string to matrix
        }
    }
    return {
        value,
        type
    };
}

exports.add2dTranslation = function( matrix, x, y ) {
    //clone the matrix first
    matrix = JSON.parse(JSON.stringify(matrix));
    if(matrix.type==='3d') {
        matrix.value[12] += parseFloat(x);
        matrix.value[13] += parseFloat(y);
    } else {
        matrix.value[4] += parseFloat(x);
        matrix.value[5] += parseFloat(y);
    }
    return matrix;
}

exports.matrixToCss = function( matrix ) {
    if(matrix.type==='3d') {
        return `matrix3d(${matrix.value.join(',')})`;
    } else {
        return `matrix(${matrix.value.join(',')})`;
    }
}

exports.cssToMatrix = function( css ) {

}


},{}]},{},[1]);
