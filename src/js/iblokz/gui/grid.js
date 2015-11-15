"use strict";

if(typeof iblokz === "undefined"){ var iblokz = {}; }
if(typeof iblokz.gui === "undefined"){ iblokz.gui = {}; }

iblokz.gui.Grid = function(dom){
	iblokz.gui.Canvas.call(this, dom);
}

iblokz.gui.Grid.prototype = Object.create( iblokz.gui.Canvas.prototype );
iblokz.gui.Grid.prototype.constructor = iblokz.gui.Grid;

iblokz.gui.Grid.prototype.refresh = function(){

	iblokz.gui.Canvas.prototype.refresh.call(this);

	var ctx = this.ctx;

	var center = new QL.ext.Vector2(ctx.canvas.width/2,ctx.canvas.height/2);
	var sizeVector = new QL.ext.Vector2(ctx.canvas.width,ctx.canvas.height);

	center.add(this.offset)

	this.line([0, center.y], [sizeVector.x, center.y], '#96DC96');

	this.line([center.x, 0], [center.x, sizeVector.y], '#96DC96');

	var step = 10;

	step *=this.zoom/100;

	var defaultLineColor = '#333';
	var segmentColor = '#555';

	for(var yPos = step; center.y - yPos > 0; yPos+=step){
		var lineColor = (parseInt(yPos/step/5) === yPos/step/5) ? segmentColor : defaultLineColor;
		this.line([0, center.y - yPos], [sizeVector.x, center.y - yPos], lineColor);
	}

	for(var yPos = step; center.y + yPos < sizeVector.y; yPos+=step){
		var lineColor = (parseInt(yPos/step/5) === yPos/step/5) ? segmentColor : defaultLineColor;
		this.line([0, center.y + yPos], [sizeVector.x, center.y + yPos], lineColor);
	}

	for(var xPos = step; center.x - xPos > 0; xPos+=step){
		var lineColor = (parseInt(xPos/step/5) === xPos/step/5) ? segmentColor : defaultLineColor;
		this.line([center.x - xPos, 0], [center.x - xPos, sizeVector.y], lineColor);
	}

	for(var xPos = step; center.x + xPos < sizeVector.x; xPos+=step){
		var lineColor = (parseInt(xPos/step/5) === xPos/step/5) ? segmentColor : defaultLineColor;
		this.line([center.x + xPos, 0],[center.x + xPos, sizeVector.y], lineColor);
	}
}

