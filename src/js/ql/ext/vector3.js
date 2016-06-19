'use strict';

import Vector2 from './vector2';

var Vector3 = function( x, y, z ){
	THREE.Vector3.call( this, x, y, z );
};

Vector3.prototype = Object.create( THREE.Vector3.prototype );
Vector3.prototype.constructor = THREE.Vector3;

Vector3.prototype.toVector2 = function(mod){

	var	v2 = new Vector2(
		this[mod.u]*mod.xD,
		this[mod.v]*mod.yD
	);

	return v2;
};


Vector3.prototype.clone = function () {
	return new Vector3( this.x, this.y, this.z );
};

export default Vector3;
