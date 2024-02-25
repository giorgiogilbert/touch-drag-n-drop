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

