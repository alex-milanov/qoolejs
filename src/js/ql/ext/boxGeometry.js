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
		// left
		this.quads.push(new QL.ext.Quad(
			this.vertices[0],
			this.vertices[1],
			this.vertices[3],
			this.vertices[2]
		));

		// 4,6,5
		// 6,7,5
		// right
		this.quads.push(new QL.ext.Quad(
			this.vertices[4],
			this.vertices[5],
			this.vertices[7],
			this.vertices[6]
		));

		// 4,5,1
		// 5,0,1
		// top
		this.quads.push(new QL.ext.Quad(
			this.vertices[4],
			this.vertices[1],
			this.vertices[0],
			this.vertices[5]
		));

		// 7,6,2
		// 6,3,2
		// bottom
		this.quads.push(new QL.ext.Quad(
			this.vertices[7],
			this.vertices[2],
			this.vertices[3],
			this.vertices[6]
		));

		// 5,7,0
		// 7,2,0
		// front
		this.quads.push(new QL.ext.Quad(
			this.vertices[5],
			this.vertices[0],
			this.vertices[2],
			this.vertices[7]
		));

		// 1,3,4
		// 3,6,4
		// back
		this.quads.push(new QL.ext.Quad(
			this.vertices[1],
			this.vertices[4],
			this.vertices[6],
			this.vertices[3]
		));

	};

	this.buildQuads();

};

QL.ext.BoxGeometry.prototype = Object.create( THREE.BoxGeometry.prototype );
QL.ext.BoxGeometry.prototype.constructor = THREE.BoxGeometry;

QL.ext.BoxGeometry.prototype.scale = function(_mod, scale2){

	var params = this.parameters;

	var modHelper = ['width','height','depth'];

	var scalePossible = true;

	
	if((params[modHelper[_mod.x]] + scale2.x*2) < 10
		|| (params[modHelper[_mod.y]] + scale2.y*2) < 10){
		scalePossible = false;
	}

	//console.log(params[modHelper[_mod.y]],modHelper[_mod.y],(_mod.yD*scale2.y*2),scalePossible)

	var scaleVectors = [];
	
	this.vertices.forEach(function(_v, index){
		var scaleVector = scale2.clone();
		var objVector = new QL.ext.Vector3().copy(_v).toVector2(_mod);
		scaleVector.x *= (objVector.x > 0) ? 1 : - 1;
		scaleVector.y *= (objVector.y > 0) ? 1 : - 1;
		scaleVectors.push(scaleVector);
		/*
		if(
			Math.abs(objVector.x+scaleVector.x)<5 ||
			Math.abs(objVector.y+scaleVector.y)<5
		) {
			scalePossible = false;
		}
		*/
	});

	if(scalePossible){
		params[modHelper[_mod.x]] += (scale2.x)*2;
		params[modHelper[_mod.y]] += (scale2.y)*2;
		this.parameters = params;
	}

	var that = this;

	if(scalePossible){
		this.vertices.forEach(function(_v, index){
			_v.add(scaleVectors[index].toVector3(_mod));
			that.verticesNeedUpdate = true;
		});
	}

	return scalePossible;
};


QL.ext.BoxGeometry.prototype.clone = function(params){

	if(!params)
		params = this.parameters;

	var geometry = new QL.ext.BoxGeometry(
		params.width, params.height, params.depth, 
		params.widthSegments, params.heightSegments, params.depthSegments
	);

	return geometry;
}
