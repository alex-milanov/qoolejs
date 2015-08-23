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

	this.zoom = 100;
	this.offset = new QL.ext.Vector2(0,0);

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

	this.hitFaces = [];

	this.scene = _scene;
	this.editor = _editor;

	var _view = this;

	// mouse manipulations
	// select
	var handleSelect = function(ev){

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
		_view.hitFaces.forEach(function(hitFace){
			if(hitFace.triangle.containsPoint(hitPos.toVector3(_view.mod))) {
				hits++;

				var hitObj = _view.scene.getObjectById(hitFace.objId);
				if(!selectedObj || hitObj.position[_view.mod.w] > selectedObj.position[_view.mod.w]){

					if(hitFace.objId === oldId)
						return true;
					selectedObj = hitObj;
				}
			}
		});

		_view.editor.select(selectedObj.id);


	};

	this.interaction = {
		status: "idle",
		start: new QL.ext.Vector2(0,0),
		last: new QL.ext.Vector2(0,0)
	}

	// mouse move
	$(this.canvas).mousedown(function(ev){

		_view.interaction.status = "mousedown";
		_view.interaction.start.set(ev.offsetX, ev.offsetY);
		_view.interaction.last.set(0, 0);

	});

	$(this.canvas).mousemove(function(ev){
		
		if(["mousedown","mousemove"].indexOf(_view.interaction.status)>-1){
			_view.interaction.status = "mousemove";

			var mousePos = new QL.ext.Vector2(ev.offsetX,ev.offsetY);

			var changeVector = mousePos.clone().sub(_view.interaction.start).divideScalar(_view.zoom/100);
			changeVector.x = parseInt(changeVector.x/2.5)*2.5
			changeVector.y = parseInt(changeVector.y/2.5)*2.5

			switch(ev.which) {

				case 1:
					if(!_view.scene.selected)
						return;

					var objectChanged = false;

					switch(_view.editor.params["obj-mode"]){
						
						case "move":
							_view.scene.selected.position.add(changeVector.clone().sub(_view.interaction.last).toVector3(_view.mod))

							objectChanged = true;

							break;
						case "scale":
							
							if( _view.scene.selected.geometry.type === "BoxGeometry" &&
								_view.scene.selected.geometry.scale(_view.mod, changeVector.clone().sub(_view.interaction.last))
							){
								objectChanged = true;
							}
							break;
					}

					if(objectChanged){
						var action = {
							type: _view.editor.params["obj-mode"],
							changeVector: changeVector.clone(),
							mod: _view.mod
						}
						_view.editor.trackAction(action);
						_view.interaction.last = changeVector.clone();
					}
					break;
				case 2:
					_view.offset.sub(changeVector.clone().sub(_view.interaction.last))
					_view.interaction.last = changeVector.clone();
					break;

			} 

		}
	});

	$(this.canvas).mouseup(function(ev){
		if(ev.which == 1 && 
			(_view.interaction.status === "mousedown" || _view.interaction.last.toArray() == [0,0])
		){
			handleSelect(ev)
		}
		_view.interaction = {
			status: "idle",
			start: new QL.ext.Vector2(0,0),
			last: new QL.ext.Vector2(0,0)
		}
		_editor.selectView(_view);
		_editor.refreshObjectPane();

	});

	$(this.canvas).on('mousewheel', function(event) {
		//console.log(event.originalEvent.deltaX, event.originalEvent.deltaY, event.originalEvent.deltaFactor);
		if(event.originalEvent.deltaY < 0 && _view.zoom < 400){
			_view.zoom += 12.5;
		} else if (_view.zoom > 25) {
			_view.zoom -= 12.5;
		}

	});

};


QL.gui.View2D.prototype.drawBox = function(_obj, _lineDash, _strokeStyle, _showCoords){

	var _mod = this.mod;
	var that = this;

	var _center = [];
	var _indexes = [];

	_obj.geometry.quads.forEach(function(_quad, index){

		var center2 = new QL.ext.Vector2(
			that.center[0],
			that.center[1]
		).add(that.offset);

		var objPos3 = new QL.ext.Vector3();
		objPos3.copy(_obj.position);

		

		var objCenter2 = objPos3.clone().toVector2(_mod).add(center2);

		// TODO: Impl a check whether a face should be displayed or not
				
		var quad2d = {
			a: new QL.ext.Vector3().copy(_quad.a).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			b: new QL.ext.Vector3().copy(_quad.b).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			c: new QL.ext.Vector3().copy(_quad.c).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			d: new QL.ext.Vector3().copy(_quad.d).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2)
		};

		that.ctx.beginPath();
		that.ctx.moveTo(quad2d.a.x,quad2d.a.y);
		that.ctx.lineTo(quad2d.b.x,quad2d.b.y);
		that.ctx.lineTo(quad2d.c.x,quad2d.c.y);
		that.ctx.lineTo(quad2d.d.x,quad2d.d.y);
		that.ctx.lineTo(quad2d.a.x,quad2d.a.y);
		that.ctx.closePath();

		that.hitFaces.push({
			triangle: new THREE.Triangle(
				quad2d.a.toVector3(_mod),
				quad2d.b.toVector3(_mod),
				quad2d.c.toVector3(_mod)
			),
			objId: _obj.id
		});
		that.hitFaces.push({
			triangle: new THREE.Triangle(
				quad2d.b.toVector3(_mod),
				quad2d.c.toVector3(_mod),
				quad2d.d.toVector3(_mod)
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
				that.ctx.fillText("a("+(new QL.ext.Vector3()).copy(_quad.a).toVector2(_mod).toArray().join(", ")+"), "+quad2d.a.toArray().join(", "),quad2d.a.x,quad2d.a.y);
				that.ctx.fillText("b("+(new QL.ext.Vector3()).copy(_quad.b).toVector2(_mod).toArray().join(", ")+"), "+quad2d.b.toArray().join(", "),quad2d.b.x,quad2d.b.y);
				that.ctx.fillText("c("+(new QL.ext.Vector3()).copy(_quad.c).toVector2(_mod).toArray().join(", ")+"), "+quad2d.c.toArray().join(", "),quad2d.c.x,quad2d.c.y);
				that.ctx.fillText("d("+(new QL.ext.Vector3()).copy(_quad.d).toVector2(_mod).toArray().join(", ")+"), "+quad2d.d.toArray().join(", "),quad2d.d.x,quad2d.d.y);
			}
			_indexes.push(index);
			_center = objCenter2.clone();
		}


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
	this.ctx.font="14px Arial";
	this.ctx.fillText(this.zoom,this.ctx.canvas.width - 65,25);
	this.ctx.font="12px Arial";
	this.ctx.fillText(this.offset.toArray().join(", "),this.ctx.canvas.width - 65, this.ctx.canvas.height - 15);


	this.center = [
		this.ctx.canvas.width/2,
		this.ctx.canvas.height/2
	];

	this.hitFaces = [];

	var that = this;

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
