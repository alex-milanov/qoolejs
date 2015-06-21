
var _canvas = {
  "tl": $(".canvas-tl")[0],
  "tr": $(".canvas-tr")[0],
  "bl": $(".canvas-bl")[0],
  "br": $(".canvas-br")[0]
}

var rect = [
  [0,0],[120,20],[20,120],[150,150]
]

var _rect = {
	position: [50,-50],
	size: 50
}

var objects = [
	{
		type: "square",
		position: [50,-50],
		size: 50
	},
	{
		type: "square",
		position: [20,20],
		size: 20
	},
	{
		type: "square",
		position: [-100,-100],
		size: 70
	},
	{
		type: "rect",
		start: [-160,20],
		finish: [-20,40]
	}
]

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

function draw(_canvas, entities){
	var ctx = _canvas.getContext("2d");
	ctx.canvas.width  = window.innerWidth/2;
	ctx.canvas.height = window.innerHeight/2;
	// draw lines in the middle
	drawHorizontalLines(ctx)
	drawVerticalLines(ctx)

	objects.forEach(function(_obj){
		switch(_obj.type){
			case "square":
				drawSquare(ctx, _obj);
				break;
			case "rect":
				drawRect(ctx, _obj);
				break;
		}
	})
}

function refresh(){
	draw(_canvas.tl, objects);
	draw(_canvas.tr, objects);
	draw(_canvas.bl, objects);
	draw(_canvas.br, objects);
}

refresh();

$(window).resize(function(){
	refresh();
});