# Touch screen drag-n-drop
Lightweight vanilla JS library to handle drag 'n drop events on touch screen devices, with a simple and native-like API.

# Usage
Import the library and init an handler, once the document is ready.\
The ```init(document, config)``` method will return an handler object, to which we can bind all needed event listeners.
Always pass a valid draggableSelector and droppableSelector to the config argument; drag/drop events won't be fired on any other DOM element.
```js
const touchDragDropLibrary = require("touch-drag-n-drop");
const touchDragDropHandler = touchDragDropLibrary.init( document, {
    draggableSelector: '.draggable',
    droppableSelector: '.droppable'
});
```

Add an event handler
```js
touchDragDropHandler.on( 'drop', (dragElement, dropElement, event) => {

    console.log('A draggable element was dropped inside a drop target');

    // implement further conditional logic if needed
    if( dropElement.matches('.someKindOfDropTarget') {
        console.log('This is a special drop target')
    }
});
```

Utility methods are available for all supported event (dragstart, dragend, dragenter, dragleave, drop). For example:
```js
touchDragDropHandler.on( 'drop', myFunction )

// is equivalent to writing

touchDragDropHandler.onDrop( myFunction )
```

Note: ```dragstart``` and ```dragend``` only accept the draggable DOM node and the DOM event as arguments for the callback function, while ```drop```, ```dragenter``` and ```dragleave``` also support a reference to the drop target node.
```js
touchDragDropHandler.onDragEnd((dragElement, event)=>{
    dragElement.classList.remove('dragging');
})
touchDragDropHandler.onDragEnter((dragElement, dropElement, event)=>{
    dragElement.classList.add('draggingOver');
    dropElement.classList.add('draggedOver');
})
```

At some point you may need to remove an event callback you previously registered.\
You can do so by storing the callbackId returned by the ```on``` method and later pass it to the ```removeCallback``` method.
```js
// let's register a callback
const myCallback = touchDragDropHandler.onDrop( (dragElement, dropElement) => {
    console.log('A draggable element was dropped inside a drop target');
});

// we don't need it anymore
touchDragDropHandler.removeDropCallback( myCallback );
// or
touchDragDropHandler.removeCallback('drop', myCallback );
```

And that's it.\
See the full demo source code [here](https://github.com/giorgiogilbert/touch-drag-n-drop/blob/main/demo), or launch it locally with
```npm run demo```
from within this repo, or even preview it live [here](http://www.giorgiogilberti.it/touch-drag-n-drop/index.html)

# Note:

Using the library as shown before won't affect how native drag/drop events are handled on non-touch-screen devices.\
You may want to write separate code to handle those. Or even add an abstraction layer to wrap it all together:
```js
touchDragDropHandler = touchDragDropLibrary.init( document, {
    draggableSelector: '.draggable',
    droppableSelector: '#dropTargetId'
});

const registerDropEventCallback = ( myFunction ) => {

    // code for NON touch screen devices
    document.getElementById('dropTargetId').addEventListener('drop', myFunction )

    // code for touch screen devices
    touchDragDropHandler.onDrop( myFunction )
}
registerDropEventCallback( () => {
    console.log('Something was dropped');
})
```

Also note that active event listeners are enforced to handle touch events. 
This may result in degraded performance in scenarios with intensive use of scroll or other touch gestures.
