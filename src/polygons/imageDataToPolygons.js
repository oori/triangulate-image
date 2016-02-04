'use strict';
import stackBlur from 'stackblur-canvas';
import delaunay from 'delaunay-fast';

import isImageData from '../util/isImageData';
import copyImageData from '../imagedata/copyImageData';
import greyscale from '../imagedata/greyscale';
import detectEdges from '../imagedata/detectEdges';
import getEdgePoints from './getEdgePoints';
import getVerticesFromPoints from './getVerticesFromPoints';
import addBoundingBoxesToPolygons from './addBoundingBoxesToPolygons';
import addColorToPolygons from './addColorToPolygons';
import addGradientsToPolygons from './addGradientsToPolygons';

export default function ( imageData, params ) {
	if ( isImageData( imageData ) ) {
		let imageSize = { width: imageData.width, height: imageData.height };

		let tmpImageData = copyImageData( imageData );
		let colorImageData = copyImageData( imageData );
		
		let blurredImageData = stackBlur.imageDataRGBA( tmpImageData, 0, 0, imageSize.width, imageSize.height, params.blur );
		let greyscaleImageData = greyscale( blurredImageData );
		let edgesImageData = detectEdges( greyscaleImageData );
		let edgePoints = getEdgePoints( edgesImageData, 50, params.accuracy );
		let edgeVertices = getVerticesFromPoints( edgePoints, params.vertexCount, params.accuracy, imageSize.width, imageSize.height );
		let polygons = delaunay.triangulate( edgeVertices );
		
		polygons = addBoundingBoxesToPolygons( polygons );

		if ( params.fill === true && params.gradients === true ) {
			polygons = addGradientsToPolygons( polygons, colorImageData, params );
		} else {
			polygons = addColorToPolygons( polygons, colorImageData, params );
		}

		return polygons;
	} else {
		throw new Error( "Can't work with the imageData provided. It seems to be corrupt." );
		return;
	}
};