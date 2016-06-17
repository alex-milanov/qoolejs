"use strict";

import jQuery from 'jquery';

import Vector2 from '../gfx/vector2';
import Element from './element';

var Canvas = function(dom) {
	Element.call(this, dom);
	this.ctx = this.dom.getContext("2d");

	this.offset = new Vector2(0,0);
	this.zoom = 100;
}

Canvas.prototype = Object.create( Element.prototype );
Canvas.prototype.constructor = Canvas;

Canvas.prototype.clear = function(){
	this.ctx.clearRect(0,0,this.dom.width,this.dom.height);
}

Canvas.prototype.line = function(start, finish, stroke, dash){
	this.ctx.beginPath();
	this.ctx.moveTo(start[0],start[1]);
	this.ctx.lineTo(finish[0],finish[1]);
	if(dash) {
		this.ctx.setLineDash(dash);
	}
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = stroke;
	this.ctx.stroke();
}

Canvas.prototype.rect = function(rect, background, stroke, dash){
	this.ctx.beginPath();
	this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
	if(background){
		this.ctx.fillStyle = background;
		this.ctx.fill();
	}
	if(dash) {
		this.ctx.setLineDash(dash);
	}
	if(stroke){
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = stroke;
		this.ctx.stroke();
	}
}

Canvas.prototype.path = function(points, background, stroke, dash){

	var scope = this;

	scope.ctx.beginPath();

	points.forEach(function(point, index){
		if(index == 0){
			scope.ctx.moveTo(point.x,point.y);
		} else {
			scope.ctx.lineTo(point.x,point.y);
		}
	})
	scope.ctx.closePath();

	if(background){
		scope.ctx.fillStyle = background;
		scope.ctx.fill();
	}
	if(dash) {
		scope.ctx.setLineDash(dash);
	}
	if(stroke){
		scope.ctx.lineWidth = 1;
		scope.ctx.strokeStyle = stroke;
		scope.ctx.stroke();
	}
}

Canvas.prototype.text = function(text, position, options){

	if(!options)
		options = {};

	if(!position)
		position = new Vector2(
			this.ctx.canvas.width/2,
			this.ctx.canvas.height/2
		)

	this.ctx.font = options.font || "12px Arial";
	this.ctx.fillStyle = options.color || "#999";

	this.ctx.fillText(text, position.x, position.y);
}

Canvas.prototype.getSize = function(){
	var size = new Rect();
	size.width = this.ctx.canvas.width;
	size.height = this.ctx.canvas.height;
	size.x = this.offset.x;
	size.y = this.offset.y;
	return size;
}

Canvas.prototype.init = function() {
	this.refresh();
}

Canvas.prototype.refresh = function() {
	this.ctx.canvas.width = jQuery(this.ctx.canvas).width();
	this.ctx.canvas.height = jQuery(this.ctx.canvas).height();
}

export default Canvas;
