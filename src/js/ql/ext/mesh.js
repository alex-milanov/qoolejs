'use strict';

import THREE from 'three';

var Mesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );
}


Mesh.prototype = Object.create( THREE.Mesh.prototype );
Mesh.prototype.constructor = THREE.Mesh;

Mesh.prototype.clone = function ( object, recursive ) {

	var geometry = this.geometry.clone();
	var material = this.material.clone();

	if ( object === undefined ) object = new Mesh( geometry, material );

	THREE.Object3D.prototype.clone.call( this, object, recursive );

	return object;

};

export default Mesh;
