'use strict';

const touchDragNDrop = require("../index.js");
const touchDragNDropHandler = touchDragNDrop.init( document, {
    draggableSelector: '.draggable',
    droppableSelector: '.droppable'
});
const firstCallbackId = touchDragNDropHandler.onDrop( (dragElement, dropElement) => {
    dragElement.parentNode.removeChild(dragElement);
    dropElement.appendChild(dragElement);
    dropElement.classList.remove('draggedOver');
    dragElement.classList.remove('draggingOver');
});

// add and remove callback for demo purpose
const secondCallbackId = touchDragNDropHandler.onDrop( (dragElement, dropElement) => {
    console.log('drop callback 2', dragElement, dropElement);
});
touchDragNDropHandler.removeDropCallback( secondCallbackId );

touchDragNDropHandler.onDragStart((dragElement, event)=>{
    dragElement.classList.add('dragging');
})
touchDragNDropHandler.onDragEnd((dragElement, event)=>{
    dragElement.classList.remove('dragging');
})

touchDragNDropHandler.onDragEnter((dragElement, dropElement, event)=>{
    dragElement.classList.add('draggingOver');
    dropElement.classList.add('draggedOver');
})
touchDragNDropHandler.onDragLeave((dragElement, dropElement, event)=>{
    dragElement.classList.remove('draggingOver');
    dropElement.classList.remove('draggedOver');
})
