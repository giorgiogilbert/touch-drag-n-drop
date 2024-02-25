import { test, assert } from 'vitest';
import { JSDOM } from 'jsdom';
import { getMatrix, add2dTranslation, matrixToCss } from '../matrix.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
const document = dom.window.document;
const window = dom.window;

test('getMatrix returns correct matrix', () => {

    const node = document.createElement('div');
    node.style.transform = 'matrix(1.5, 0, 0, 1.5, 10, 20)';

    const result = getMatrix(node, window);
    assert.equal(result.type, '2d');
    assert.deepEqual(result.value, [1.5, 0, 0, 1.5, 10, 20]);
});

test('add2dTranslation modifies matrix', () => {
    const matrix = { type: '2d', value: [1, 0, 0, 1, 10, 20] };
    const newX = 5;
    const newY = -15;

    const modifiedMatrix = add2dTranslation(matrix, newX, newY);

    assert.deepEqual(modifiedMatrix.value, [1, 0, 0, 1, 15, 5]);
});

test('matrixToCss converts matrix to CSS string', () => {
    const matrix2d = { type: '2d', value: [1, 0, 0, 1, 15, 5] };
    const matrix3d = { type: '3d', value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 15, 5, 0, 1] };

    const css2d = matrixToCss(matrix2d);
    const css3d = matrixToCss(matrix3d);

    assert.equal(css2d, 'matrix(1,0,0,1,15,5)');
    assert.equal(css3d, 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,15,5,0,1)');
});
