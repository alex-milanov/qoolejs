"use strict";

if(typeof iblokz === "undefined"){ var iblokz = {}; }
if(typeof iblokz.gfx === "undefined"){ iblokz.gfx = {}; }

iblokz.gfx.Vector2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

iblokz.gfx.Vector2.prototype.set = function(x, y){
	this.x = x || this.x;
	this.y = y || this.y;

	return this;
}

iblokz.gfx.Vector2.prototype.toArray = function(){
	var coordArr = [];
	coordArr[0] = this.x;
	coordArr[1] = this.y;

	return coordArr;
}

iblokz.gfx.Vector2.prototype.fromArray = function(coordArr){
	this.x = coordArr[0] || this.x;
	this.y = coordArr[1] || this.y;

	return this;
}

iblokz.gfx.Vector2.prototype.copy = function(v){
	this.x = v.x || this.x;
	this.y = v.y || this.y;

	return this;
}

iblokz.gfx.Vector2.prototype.clone = function(){
	var newVector2 = new iblokz.gfx.Vector2();
	newVector2.x = this.x;
	newVector2.y = this.y;
	return newVector2;
}


// TODO: Add vector operations
iblokz.gfx.Vector2.prototype.add = function(v){
	this.x += v.x;
	this.y += v.y;

	return this;
}

iblokz.gfx.Vector2.prototype.multiply = function(v){
	this.x *= v.x;
	this.y *= v.y;

	return this;
}

iblokz.gfx.Vector2.prototype.multiplyScalar = function(s){
	this.x *= s;
	this.y *= s;

	return this;
}

iblokz.gfx.Vector2.prototype.sub = function(v){
	this.x -= v.x;
	this.y -= v.y;

	return this;
}

iblokz.gfx.Vector2.prototype.divide = function(v){
	this.x /= v.x;
	this.y /= v.y;

	return this;
}

iblokz.gfx.Vector2.prototype.divideScalar = function(s){
	this.x /= s;
	this.y /= s;

	return this;
}

// TODO: Add conversion from and to THREE.js Vector
iblokz.gfx.Vector2.prototype.convertToThreeJSVector2 = function(){
	if(THREE && THREE.Vector2){
		var threeJSVector2 = new THREE.Vector2();
		threeJSVector2.x = this.x;
		threeJSVector2.y = this.y;

		return threeJSVector2;
	}
	return null;
}
