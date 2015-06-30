"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.Vector3 = function( x, y, z ){
	THREE.Vector3.call( this, x, y, z );
}

QL.ext.Vector3.prototype = Object.create( THREE.Vector3.prototype );
QL.ext.Vector3.prototype.constructor = THREE.Vector3;

QL.ext.Vector3.prototype.toVector2 = function(mod){
	
	var	v2 = new QL.ext.Vector2(
		this[mod.u]*mod.xD,
		this[mod.v]*mod.yD
	)

	return v2;
}


QL.ext.Vector3.prototype.clone = function () {
	return new QL.ext.Vector3( this.x, this.y, this.z );
}