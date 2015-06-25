"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.BoxGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	THREE.BoxGeometry.call( this, width, height, depth, widthSegments, heightSegments, depthSegments );	

	this.buildQuads = function(){

		this.quads = [];

		// manually first

		// 0,2,1
		// 2,3,1
		this.quads.push(new QL.ext.Quad(
			this.vertices[0],
			this.vertices[1],
			this.vertices[2],
			this.vertices[3]
		));

		// 4,6,5
		// 6,7,5
		this.quads.push(new QL.ext.Quad(
			this.vertices[4],
			this.vertices[5],
			this.vertices[6],
			this.vertices[7]
		));

		// 4,5,1
		// 5,0,1
		this.quads.push(new QL.ext.Quad(
			this.vertices[0],
			this.vertices[1],
			this.vertices[4],
			this.vertices[5]
		));

		// 7,6,2
		// 6,3,2
		this.quads.push(new QL.ext.Quad(
			this.vertices[2],
			this.vertices[3],
			this.vertices[6],
			this.vertices[7]
		));

		// 5,7,0
		// 7,2,0
		this.quads.push(new QL.ext.Quad(
			this.vertices[0],
			this.vertices[2],
			this.vertices[5],
			this.vertices[7]
		));

		// 1,3,4
		// 3,6,4
		this.quads.push(new QL.ext.Quad(
			this.vertices[1],
			this.vertices[3],
			this.vertices[4],
			this.vertices[6]
		));

	}

	this.buildQuads();

}


QL.ext.BoxGeometry.prototype = Object.create( THREE.BoxGeometry.prototype );
QL.ext.BoxGeometry.prototype.constructor = THREE.BoxGeometry;