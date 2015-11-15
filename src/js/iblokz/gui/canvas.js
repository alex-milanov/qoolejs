"use strict";

if(typeof iblokz === "undefined"){ var iblokz = {}; }
if(typeof iblokz.gui === "undefined"){ iblokz.gui = {}; }

iblokz.gui.Canvas = function(dom) {
	iblokz.gui.Element.call(this, dom);
	this.ctx = this.dom.getContext("2d");

	this.offset = new iblokz.gfx.Vector2(0,0);
	this.zoom = 100;
}

iblokz.gui.Canvas.prototype = Object.create( iblokz.gui.Element.prototype );
iblokz.gui.Canvas.prototype.constructor = iblokz.gui.Canvas;

iblokz.gui.Canvas.prototype.clear = function(){
	this.ctx.clearRect(0,0,this.dom.width,this.dom.height);
}

iblokz.gui.Canvas.prototype.line = function(start, finish, stroke, dash){
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

iblokz.gui.Canvas.prototype.rect = function(rect, background, stroke, dash){
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

iblokz.gui.Canvas.prototype.path = function(points, background, stroke, dash){
	this.ctx.beginPath();
	
	points.forEach(function(point, index){
		if(index == 0){
			ctx.moveTo(point.x,point.y);
		} else {
			ctx.lineTo(point.x,point.y);
		}
	})
	ctx.closePath();

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

iblokz.gui.Canvas.prototype.getSize = function(){
	var size = new iblokz.gfx.Rect();
	size.width = this.ctx.canvas.width;
	size.height = this.ctx.canvas.height;
	size.x = this.offset.x;
	size.y = this.offset.y;
	return size;
}

iblokz.gui.Canvas.prototype.init = function() {
	this.refresh();
} 

iblokz.gui.Canvas.prototype.refresh = function() {
	this.ctx.canvas.width = $(this.ctx.canvas).width();
	this.ctx.canvas.height = $(this.ctx.canvas).height();
} 