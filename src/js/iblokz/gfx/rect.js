"use strict";

if(typeof iblokz === "undefined"){ var iblokz = {}; }
if(typeof iblokz.gfx === "undefined"){ iblokz.gfx = {}; }

iblokz.gfx.Rect = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

iblokz.gfx.Rect.prototype.set = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	return this;
}

iblokz.gfx.Rect.prototype.setStart = function(start){
	this.x = start.x;
	this.y = start.y;
	return this;
}

iblokz.gfx.Rect.prototype.getStart = function(){
	var start = new iblokz.gfx.Vector2();
	start.x = this.x;
	start.y = this.y;
	return start;
}


iblokz.gfx.Rect.prototype.setEnd = function(end){
	this.width = end.x - this.x;
	this.height = end.y - this.y;
	return this;
}

iblokz.gfx.Rect.prototype.getEnd = function(){
	var end = new iblokz.gfx.Vector2();
	end.x = this.x + this.width;
	end.y = this.y + this.height;
	return end;
}


iblokz.gfx.Rect.prototype.getSize = function(){
	var end = new iblokz.gfx.Vector2();
	end.x = this.width;
	end.y = this.height;
	return end;
}

iblokz.gfx.Rect.prototype.fromVectors = function(a, b){
	
	if(a.x <= b.x){
		this.x = a.x;
		this.width = b.x - a.x;
	} else {
		this.x = b.x;
		this.width = a.x - b.x;
	}

	if(a.y <= b.y){
		this.y = a.y;
		this.height = b.y - a.y;
	} else {
		this.y = b.y;
		this.height = a.y - b.y;
	}

	return this;
}

iblokz.gfx.Rect.prototype.pan = function(v) {
	var start = this.getStart();
	start.add(v);
	this.setStart(start);
	return this;
}

iblokz.gfx.Rect.prototype.resize = function(v) {
	var end = this.getEnd();
	end.add(v);
	this.setEnd(end);
	return this;
}

iblokz.gfx.Rect.prototype.containsVector = function(v){
	if((v.x >= this.x && v.x <= this.x+this.width)
		&& (v.y >= this.y && v.y <= this.y+this.height)){
		return true;
	} else {
		return false;
	}
}

iblokz.gfx.Rect.prototype.containsRect = function(rect){
	var start = this.getStart();
	var end = this.getEnd();
	if((start.x <= rect.x && rect.x+rect.width <= end.x)
		&& (start.y <= rect.y && rect.y+rect.height <= end.y)) {
		return true;
	} else {
		return false;
	}
}

iblokz.gfx.Rect.prototype.contains = function(obj){
	if(obj instanceof iblokz.gfx.Rect){
		return this.containsRect(obj);
	} 
	if(obj instanceof iblokz.gfx.Vector2){
		return this.containsVector(obj);
	}
	return false;
}

iblokz.gfx.Rect.prototype.copy = function(rect){
	this.x = rect.x || this.x;
	this.y = rect.y || this.y;
	this.width = rect.width || this.width;
	this.height = rect.height || this.height;

	return this;
}

iblokz.gfx.Rect.prototype.clone = function(){
	var newRect = new iblokz.gfx.Rect();
	newRect.x = this.x;
	newRect.y = this.y;
	newRect.width = this.width;
	newRect.height = this.height;
	return newRect;
}