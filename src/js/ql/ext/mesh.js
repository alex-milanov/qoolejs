"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.Mesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );
}


QL.ext.Mesh.prototype = Object.create( THREE.Mesh.prototype );
QL.ext.Mesh.prototype.constructor = THREE.Mesh;

QL.ext.Mesh.prototype.clone = function ( object, recursive ) {

	var geometry = this.geometry.clone()

	if ( object === undefined ) object = new QL.ext.Mesh( geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object, recursive );

	return object;

};
