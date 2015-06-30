"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.Vector2 = function( x, y ){
	THREE.Vector2.call( this, x, y );
}

QL.ext.Vector2.prototype = Object.create( THREE.Vector2.prototype );
QL.ext.Vector2.prototype.constructor = THREE.Vector2;

QL.ext.Vector2.prototype.toVector3 = function(mod, v3){
	if(!v3)
		v3 = new QL.ext.Vector3()

	v3[mod.u] = mod.xD*this.x;
	v3[mod.v] = mod.yD*this.y;

	return v3;
}

QL.ext.Vector2.prototype.clone = function () {
	return new QL.ext.Vector2( this.x, this.y );
}