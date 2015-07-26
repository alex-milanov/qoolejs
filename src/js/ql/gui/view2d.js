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
	];

	var start = [
		center[0]+_obj.start[0],
		center[1]+_obj.start[1]
	];

	var finish = [
		_obj.finish[0]-_obj.start[0],
		_obj.finish[1]-_obj.start[1]
	];

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
	];

	var start = [
		center[0]+_obj.position[0]-_obj.size/2,
		center[1]+_obj.position[1]-_obj.size/2,
	];

	var finish = [
		center[0]+_obj.position[0]+_obj.size/2-start[0],
		center[1]+_obj.position[1]+_obj.size/2-start[1],
	];
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
	],[0],'#96DC96');

	var step = 10;

	for(var yPos = step; ctx.canvas.height/2 - yPos > 0; yPos+=step){
		drawLine(ctx, [
			0, ctx.canvas.height/2-yPos
		],[
			ctx.canvas.width, ctx.canvas.height/2 - yPos
		],[0],'#333');
		drawLine(ctx, [
			0, ctx.canvas.height/2 + yPos
		],[
			ctx.canvas.width, ctx.canvas.height/2 + yPos
		],[0],'#333');
	}

}

function drawVerticalLines(ctx){
	drawLine(ctx, [
		ctx.canvas.width/2, 0
	],[
		ctx.canvas.width/2, ctx.canvas.height
	],[0],'#96DC96');

	var step = 10;

	for(var xPos = step; ctx.canvas.width/2 - xPos > 0; xPos+=step){

		drawLine(ctx, [
			ctx.canvas.width/2 - xPos, 0
		],[
			ctx.canvas.width/2 - xPos, ctx.canvas.height
		],[0],'#333');

		drawLine(ctx, [
			ctx.canvas.width/2 + xPos, 0
		],[
			ctx.canvas.width/2 + xPos, ctx.canvas.height
		],[0],'#333');
	}

}

QL.gui.View2D = function(_conf, _scene, _editor){
	this.canvas = $(_conf.canvas)[0];
	this.ctx = this.canvas.getContext("2d");
	this.perspective = _conf.perspective;
	this.center = [
		this.ctx.canvas.width/2,
		this.ctx.canvas.height/2
	];

	this.mod = {
		x: 0, xD: 1,
		y: 1, yD: -1,
		u: "x",
		v: "y"
	};

	switch(this.perspective){
		case "top":
			this.mod.x = 0;
			this.mod.y = 2;
			this.mod.z = 1;
			this.mod.u = "x";
			this.mod.v = "z";
			this.mod.w = "y";
			this.mod.yD = 1;
			break;
		case "front":
			this.mod.x = 0;
			this.mod.y = 1;
			this.mod.z = 2;
			this.mod.u = "x";
			this.mod.v = "y";
			this.mod.w = "z";
			break;
		case "side":
			this.mod.x = 2;
			this.mod.y = 1;
			this.mod.z = 0;
			this.mod.u = "z";
			this.mod.v = "y";
			this.mod.w = "x";
			this.mod.xD = -1;
			break;
	}

	this.hitAreas = [];

	this.scene = _scene;
	this.editor = _editor;

	var _view = this;

	// mouse manipulations
	// select
	$(this.canvas).click(function(ev){

		var hitPos = new QL.ext.Vector2(
			ev.offsetX,
			ev.offsetY
		);

		var oldId = false;
		if(_view.scene.selected){
			oldId = _view.scene.selected.id;
		}

		var selectedObj = false;
		var hits = 0;
		_view.hitAreas.forEach(function(hitArea){
			if((hitArea.start.x <= hitPos.x && hitPos.x <= hitArea.end.x) &&
				(hitArea.start.y <= hitPos.y && hitPos.y <= hitArea.end.y)) {
				hits++;

				var hitObj = _view.scene.getObjectById(hitArea.objId);
				if(!selectedObj || hitObj.position[_view.mod.w] > selectedObj.position[_view.mod.w]){

					if(hitArea.objId === oldId)
						return true;
					selectedObj = hitObj;
				}
			}
		});

		_view.editor.select(selectedObj.id);


	});

	this.operation = "idle";
	this.dragStartPos = [];
	this.lastPos = [];
	this.lastScale = [];
	this.dragOffset = [];
	// mouse move
	$(this.canvas).mousedown(function(ev){
		_view.operation = "dragstart";
		_view.dragStartPos = _view.lastPos = [
			ev.offsetX,
			ev.offsetY
		];
		_view.lastChange = [0,0];
		if(_view.scene.selected){
			var pos = [
				_view.scene.selected.position[_view.mod.u],
				_view.scene.selected.position[_view.mod.v]
			];
			_view.dragOffset = [
				pos[0],
				pos[1]
			];
		}
	});

	$(this.canvas).mousemove(function(ev){
		if(["dragstart","dragging"].indexOf(_view.operation)>-1){
			_view.operation = "dragging";

			if(!_view.scene.selected){
				return;
			}

			var mousePos = [
				ev.offsetX,
				ev.offsetY
			];

			var changeVector = [
				parseInt((mousePos[0]-_view.dragStartPos[0])/5)*5,
				parseInt((mousePos[1]-_view.dragStartPos[1])/5)*5,
			];

			var objectChanged = false;

			switch(_view.editor.params["obj-mode"]){
				
				case "move":
					var dragVector = [
						mousePos[0]-_view.dragStartPos[0],
						mousePos[1]-_view.dragStartPos[1]
					];

					_view.scene.selected.position[_view.mod.u] = (_view.mod.xD*changeVector[0])+_view.dragOffset[0];
					_view.scene.selected.position[_view.mod.v] = (_view.mod.yD*changeVector[1])+_view.dragOffset[1];
					objectChanged = true;

					break;
				case "scale":
					
					if( _view.scene.selected.geometry.type === "BoxGeometry" &&
						_view.scene.selected.geometry.scale(_view.mod, new QL.ext.Vector2(
						changeVector[0] - _view.lastChange[0],
						-(changeVector[1] - _view.lastChange[1])
					))){
						objectChanged = true;
					}
					break;
			}

			if(objectChanged){
				var action = {
					type: _view.editor.params["obj-mode"],
					changeVector: changeVector,
					mod: _view.mod
				}
				_view.editor.trackAction(action);
				_view.lastChange = changeVector;
			}

		}
	});

	$(this.canvas).mouseup(function(ev){
		_view.operation="idle";
		_view.dragStartPos = [];
		_view.dragPos = [];
		_view.dragOffset = [];
	});

};

QL.gui.View2D.prototype.drawCube = function(_obj){

	var start = [
		this.center[0]+this.mod.xD*(_obj.position[this.mod.x]-_obj.size/2),
		this.center[1]+this.mod.yD*(_obj.position[this.mod.y]-_obj.size/2),
	];

	var finish = [
		this.center[0]+this.mod.xD*(_obj.position[this.mod.x]+_obj.size/2)-start[0],
		this.center[1]+this.mod.yD*(_obj.position[this.mod.y]+_obj.size/2)-start[1],
	];

	this.ctx.beginPath();
	this.ctx.rect(start[0], start[1], finish[0], finish[1]);
	this.ctx.strokeStyle = '#777';
	this.ctx.setLineDash([0]);
	this.ctx.stroke();

};

QL.gui.View2D.prototype.drawBlock = function(_obj){

	var start = [
		this.center[0]+this.mod.xD*(_obj.start[this.mod.x]),
		this.center[1]+this.mod.yD*(_obj.start[this.mod.y])
	];

	var finish = [
		this.mod.xD*(_obj.finish[this.mod.x]-_obj.start[this.mod.x]),
		this.mod.yD*(_obj.finish[this.mod.y]-_obj.start[this.mod.y])
	];

	this.ctx.beginPath();
	this.ctx.rect(start[0],start[1],finish[0],finish[1]);
	this.ctx.strokeStyle = '#777';
	this.ctx.setLineDash([0]);
	this.ctx.stroke();
};

QL.gui.View2D.prototype.drawBox = function(_obj, _lineDash, _strokeStyle, _showCoords){

	var _mod = this.mod;
	var that = this;

	//console.log(_obj)

	var _center = [];
	var _indexes = [];

	_obj.geometry.quads.forEach(function(_quad, index){

		//if(index == 4){

			//console.log(_quad);
			var center2 = new QL.ext.Vector2(
				that.center[0],
				that.center[1]
			);

			var objPos3 = new QL.ext.Vector3();
			objPos3.copy(_obj.position);

			var objStart3 = new QL.ext.Vector3();
			objStart3.addVectors(objPos3,_quad.a);

			var objStart2 = objStart3.toVector2(_mod);
			objStart2.add(center2);

			var objSpan3 = new QL.ext.Vector3();
			objSpan3.subVectors(_quad.c, _quad.a);
			var objSpan2 = objSpan3.toVector2(_mod);

			var objCenter2 = objStart2.clone().add(objSpan2.clone().divideScalar(2));

			if(objSpan2.x !== 0 && objSpan2.y !== 0){
				that.ctx.beginPath();
				that.ctx.rect(objStart2.x,objStart2.y,objSpan2.x,objSpan2.y);

				that.hitAreas.push({
					start: new QL.ext.Vector2(
						((objSpan2.x > 0) ? objStart2.x : objStart2.x+objSpan2.x),
						((objSpan2.y > 0) ? objStart2.y : objStart2.y+objSpan2.y)
					),
					end:  new QL.ext.Vector2(
						((objSpan2.x < 0) ? objStart2.x : objStart2.x+objSpan2.x),
						((objSpan2.y < 0) ? objStart2.y : objStart2.y+objSpan2.y)
					),
					objId: _obj.id
				});

				that.ctx.strokeStyle = _strokeStyle || '#555';
				var baseColor = new THREE.Color(0x555555);
				/*if(_obj.selected){
					that.ctx.strokeStyle = "#DC3333";
				}*/

				that.ctx.setLineDash(_lineDash || [0]);
				that.ctx.stroke();

				if(_showCoords){
					that.ctx.font="12px Arial";
					that.ctx.fillStyle="#999";

				if(that.editor.indexes.length === 0 || that.editor.indexes.indexOf(index+"")>-1){
						that.ctx.fillText("a("+(new QL.ext.Vector3()).copy(_quad.a).toVector2(_mod).toArray().join(", ")+"), "+objStart2.toArray().join(", "),objStart2.x,objStart2.y);
						that.ctx.fillText("b("+(new QL.ext.Vector3()).copy(_quad.b).toVector2(_mod).toArray().join(", ")+"), "+objStart2.y,(objStart2.x+objSpan2.x),objStart2.y);
						that.ctx.fillText("c("+(new QL.ext.Vector3()).copy(_quad.c).toVector2(_mod).toArray().join(", ")+"), "+objStart2.clone().add(objSpan2).toArray().join(", "),objStart2.x+objSpan2.x,objStart2.y+objSpan2.y);
						that.ctx.fillText("d("+(new QL.ext.Vector3()).copy(_quad.d).toVector2(_mod).toArray().join(", ")+"), "+objStart2.x+", "+(objStart2.y+objSpan2.y),objStart2.x,objStart2.y+objSpan2.y);
					}
					_indexes.push(index);
					_center = objCenter2.clone();
				}

			}
		//}

	});

	if(_showCoords){
		that.ctx.fillText(_indexes.join(", "),_center.x,_center.y);
	}


};

QL.gui.View2D.prototype.refresh = function(_entities){
	this.canvas.width = $(this.canvas.parentNode).width()/2;
	this.canvas.height = $(this.canvas.parentNode).height()/2;
	// draw lines in the middle
	drawHorizontalLines(this.ctx);
	drawVerticalLines(this.ctx);

	// draw text
	this.ctx.font="16px Arial";
	this.ctx.fillStyle="#999";
	this.ctx.fillText(this.perspective,15,25);


	this.center = [
		this.ctx.canvas.width/2,
		this.ctx.canvas.height/2
	];

	this.hitAreas = [];

	var that = this;

	/*
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
*/

	this.scene.children.forEach(function(_obj){
		if(_obj.type === "Mesh"){
			switch(_obj.geometry.type){
				case "BoxGeometry":
					that.drawBox(_obj);
				break;
			}
		}
	});

	// draw the selected again
	if(this.scene.selected){

		this.drawBox(this.scene.selected,[0],"#DC3333",this.editor.params.debug);
		if(this.editor.params["obj-mode"] == "scale"){
			this.drawBox(this.scene.selected,[5,10],"#DCDC33");
		}
	}
};
