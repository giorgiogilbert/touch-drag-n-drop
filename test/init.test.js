import { test, assert } from 'vitest';
import touchDragNDrop from '../index.js';

test('Init', () => {
    const invalidDocumentValues = [
        null,
        undefined,
        '',
        'string',
        1,
        {},
        [],
        () => {},
        new Date(),
        /regex/,
        Symbol('symbol'),
        true,
        {foo:'bar'}
    ];
    for (const invalidDocumentValue of invalidDocumentValues) {
        assert.throws(() => touchDragNDrop.init(invalidDocumentValue), Error);
    }

    const mockedDocument = {
        querySelector: () => {},
        querySelectorAll: () => [],
        addEventListener: () => {}
    }
    const invalidConfigValues = [
        null,
        undefined,
        '',
        'string',
        1,
        {},
        [],
        () => {},
        new Date(),
        /regex/,
        Symbol('symbol'),
        true,
        {foo:'bar'},
        {draggableSelector: null},
        {draggableSelector: undefined},
        {draggableSelector: ''},
        {draggableSelector: 1},
        {draggableSelector: false},
        {draggableSelector: {}},
        {draggableSelector: []},
        {draggableSelector: ()=>{}},
        {draggableSelector: /regex/},
        {draggableSelector: Symbol('symbol')},
        {draggableSelector: true},
        {draggableSelector: {foo:'bar'}},
        {droppableSelector: null, draggableSelector: '.mySelector'},
        {droppableSelector: undefined, draggableSelector: '.mySelector'},
        {droppableSelector: '', draggableSelector: '.mySelector'},
        {droppableSelector: 1, draggableSelector: '.mySelector'},
        {droppableSelector: false, draggableSelector: '.mySelector'},
        {droppableSelector: '.mySelector', draggableSelector: null},
        {droppableSelector: '.mySelector', draggableSelector: undefined},
        {droppableSelector: '.mySelector', draggableSelector: ''},
    ]
    for (const invalidConfigValue of invalidConfigValues) {
        assert.throws(() => touchDragNDrop.init(mockedDocument, invalidConfigValue), Error);
    }

    const validConfig = {
        draggableSelector: '.mySelector',
        droppableSelector: '.myOtherSelector'
    }
    const touchDragNDropHandler = touchDragNDrop.init(mockedDocument, validConfig);
    assert.isObject(touchDragNDropHandler);
});
