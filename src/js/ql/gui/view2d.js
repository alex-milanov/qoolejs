"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }

function drawLine(ctx, start, finish, dash, stroke){
	ctx.beginPath();
	ctx.moveTo(start[0],start[1]);
	ctx.lineTo(finish[0],finish[1]);
	ctx.setLineDash(dash);
	ctx.strokeStyle = stroke;
	ctx.stroke();
}

function drawRect(ctx, _obj){
	var center = [
		ctx.canvas.width/2,
		ctx.canvas.height/2
	]

	var start = [
		center[0]+_obj.start[0],
		center[1]+_obj.start[1]
	]

	var finish = [
		_obj.finish[0]-_obj.start[0],
		_obj.finish[1]-_obj.start[1]
	]

	ctx.beginPath();
	ctx.rect(start[0],start[1],finish[0],finish[1]);
	ctx.strokeStyle = '#777';
	ctx.setLineDash([0]);
	ctx.stroke();
}

function drawSquare(ctx, _obj){
	var center = [
		ctx.canvas.width/2,
		ctx.canvas.height/2
	]

	var start = [
		center[0]+_obj.position[0]-_obj.size/2,
		center[1]+_obj.position[1]-_obj.size/2,
	]

	var finish = [
		center[0]+_obj.position[0]+_obj.size/2-start[0],
		center[1]+_obj.position[1]+_obj.size/2-start[1],
	]
	ctx.beginPath();
	ctx.rect(start[0], start[1], finish[0], finish[1]);
	ctx.strokeStyle = '#777';
	ctx.setLineDash([0]);
	ctx.stroke();
}

function drawHorizontalLines(ctx){
	drawLine(ctx, [
		0, ctx.canvas.height/2
	],[
		ctx.canvas.width, ctx.canvas.height/2
	],[5],'#444')

	var step = 10;

	for(var yPos = ctx.canvas.height/2-step; yPos > 0; yPos-=step){
		drawLine(ctx, [
			0, yPos
		],[
			ctx.canvas.width, yPos
		],[0],'#333')
	}

	for(var yPos = ctx.canvas.height/2+step; yPos < ctx.canvas.height; yPos+=step){
		drawLine(ctx, [
			0, yPos
		],[
			ctx.canvas.width, yPos
		],[0],'#333')
	}
}

function drawVerticalLines(ctx){
	drawLine(ctx, [
		ctx.canvas.width/2, 0
	],[
		ctx.canvas.width/2, ctx.canvas.height
	],[5],'#444')

	var step = 10;

	for(var xPos = ctx.canvas.width/2-step; xPos > 0; xPos-=step){
		drawLine(ctx, [
			xPos, 0
		],[
			xPos, ctx.canvas.height
		],[0],'#333')
	}

	for(var xPos = ctx.canvas.width/2+step; xPos < ctx.canvas.width; xPos+=step){
		drawLine(ctx, [
			xPos, 0
		],[
			xPos, ctx.canvas.height
		],[0],'#333')
	}

}

QL.gui.View2D = function(_conf){
	this.canvas = $(_conf.canvas)[0];
	this.ctx = this.canvas.getContext("2d");
	this.perspective = _conf.perspective;
	this.center = [
		this.ctx.canvas.width/2,
		this.ctx.canvas.height/2
	]

	this.mod = {
		x: 0, xD: 1,
		y: 1, yD: -1
	}

	switch(this.perspective){
		case "top":
			this.mod.x = 0;
			this.mod.y = 2;
			this.mod.yD = 1;
			break;
		case "front":
			this.mod.x = 0;
			this.mod.y = 1;
			break;
		case "side":
			this.mod.x = 2;
			this.mod.y = 1;
			this.mod.xD = -1;
			break;
	}
}

QL.gui.View2D.prototype.drawCube = function(_obj){
	
	var start = [
		this.center[0]+this.mod.xD*(_obj.position[this.mod.x]-_obj.size/2),
		this.center[1]+this.mod.yD*(_obj.position[this.mod.y]-_obj.size/2),
	]

	var finish = [
		this.center[0]+this.mod.xD*(_obj.position[this.mod.x]+_obj.size/2)-start[0],
		this.center[1]+this.mod.yD*(_obj.position[this.mod.y]+_obj.size/2)-start[1],
	]

	this.ctx.beginPath();
	this.ctx.rect(start[0], start[1], finish[0], finish[1]);
	this.ctx.strokeStyle = '#777';
	this.ctx.setLineDash([0]);
	this.ctx.stroke();

}

QL.gui.View2D.prototype.drawBlock = function(_obj){

	var start = [
		this.center[0]+this.mod.xD*(_obj.start[this.mod.x]),
		this.center[1]+this.mod.yD*(_obj.start[this.mod.y])
	]

	var finish = [
		this.mod.xD*(_obj.finish[this.mod.x]-_obj.start[this.mod.x]),
		this.mod.yD*(_obj.finish[this.mod.y]-_obj.start[this.mod.y])
	]

	this.ctx.beginPath();
	this.ctx.rect(start[0],start[1],finish[0],finish[1]);
	this.ctx.strokeStyle = '#777';
	this.ctx.setLineDash([0]);
	this.ctx.stroke();
}

QL.gui.View2D.prototype.refresh = function(_entities){
	this.canvas.width = $(this.canvas.parentNode).width()/2;
	this.canvas.height = $(this.canvas.parentNode).height()/2;
	// draw lines in the middle
	drawHorizontalLines(this.ctx)
	drawVerticalLines(this.ctx)

	// draw text
	this.ctx.font="16px Arial";
	this.ctx.fillStyle="#999";
	this.ctx.fillText(this.perspective,15,25);


	this.center = [
		this.ctx.canvas.width/2,
		this.ctx.canvas.height/2
	]

	var that = this;

	_entities.forEach(function(_obj){
		switch(_obj.type){
			case "cube":
				that.drawCube(_obj);
				break;
			case "block":
				that.drawBlock(_obj);
				break;
		}
	})
}