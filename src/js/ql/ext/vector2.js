'use strict';

import THREE from 'three';
import Vector3 from './vector3';

var Vector2 = function( x, y ){
	THREE.Vector2.call( this, x, y );
};

Vector2.prototype = Object.create( THREE.Vector2.prototype );
Vector2.prototype.constructor = THREE.Vector2;

Vector2.prototype.toVector3 = function(mod, v3){
	if(!v3)
		v3 = new Vector3();

	v3[mod.u] = mod.xD*this.x;
	v3[mod.v] = mod.yD*this.y;

	return v3;
};

Vector2.prototype.clone = function () {
	return new Vector2( this.x, this.y );
};

export default Vector2;
