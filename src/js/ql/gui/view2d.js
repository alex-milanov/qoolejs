"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }

function drawLine(ctx, start, finish, dash, stroke){
	ctx.beginPath();
	ctx.moveTo(start[0],start[1]);
	ctx.lineTo(finish[0],finish[1]);
	//ctx.setLineDash(dash);
	ctx.strokeStyle = stroke;
	ctx.stroke();
}

QL.gui.View2D = function(_conf, _scene, _editor){
	this._dom = $(_conf.dom)[0];
	//this.ctx = this.canvas.getContext("2d");

	this._layers = {
		grid: $(this._dom).find('.grid-layer')[0].getContext("2d"),
		scene: $(this._dom).find('.grid-layer')[0].getContext("2d"),
		selection: $(this._dom).find('.selection-layer')[0].getContext("2d"),
		indicators: $(this._dom).find('.indicators-layer')[0].getContext("2d")
	};

	this._needsRefresh = [];

	this.perspective = _conf.perspective;

	this.center = new QL.ext.Vector2(
		this._dom.width/2,
		this._dom.height/2
	);

	this.zoom = 100;
	this.offset = new QL.ext.Vector2(0,0);

	this.mod = {
		x: 0, xD: 1,
		y: 1, yD: -1,
		zD: 1,
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
	$(this._dom).mousedown(function(ev){

		_view.interaction.status = "mousedown";
		_view.interaction.start.set(ev.offsetX, ev.offsetY);
		_view.interaction.last.set(0, 0);

	});

	$(this._dom).mousemove(function(ev){
		
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

					var interactionVector = changeVector.clone().sub(_view.interaction.last).toVector3(_view.mod);

					switch(_view.editor.params["obj-mode"]){
						case "move":
							QL.ext.interactor.move(_view.scene.selected, interactionVector);
							break;
						case "scale":
							interactionVector.z = -interactionVector.z;
							QL.ext.interactor.scale(_view.scene.selected, interactionVector.divideScalar(10));
							break;
						case "rotate":

							var oldRotation = _view.scene.selected.rotation.clone();

							var mousePos3 = mousePos.clone().divideScalar(_view.zoom/100).sub(_view.center).toVector3(_view.mod);
							mousePos3[_view.mod.w] = _view.scene.selected.position[_view.mod.w];
							//console.log(mousePos3);
							_view.scene.selected.lookAt(mousePos3);
							
							/*
							var rotationVector = new QL.ext.Vector3();
							rotationVector[_view.mod.w] = interactionVector[_view.mod.u];
							QL.ext.interactor.rotate(_view.scene.selected, rotationVector);
							*/
							break;
					}

					objectChanged = true;

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

	$(this._dom).mouseup(function(ev){
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

	$(this._dom).on('mousewheel', function(event) {
		//console.log(event.originalEvent.deltaX, event.originalEvent.deltaY, event.originalEvent.deltaFactor);
		if(event.originalEvent.deltaY < 0 && _view.zoom < 400){
			_view.zoom += 12.5;
		} else if (_view.zoom > 25) {
			_view.zoom -= 12.5;
		}

	});

};


QL.gui.View2D.prototype.drawBox = function(ctx, _obj, _lineDash, _strokeStyle, _showCoords){

	var _mod = this.mod;
	var that = this;

	var _center = [];
	var _indexes = [];

	var scaleVector = new QL.ext.Vector3().copy(_obj.scale);

	_obj.geometry.quads.forEach(function(_quad, index){

		var center2 = that.center.clone().add(that.offset);

		var objPos3 = new QL.ext.Vector3();
		objPos3.copy(_obj.position);

		var objCenter2 = objPos3.clone().toVector2(_mod).add(center2);

		//var scaleVector2 = scaleVector.toVector2(_mod);
		// TODO: Impl a check whether a face should be displayed or not
				
		var quad2d = {
			a: new QL.ext.Vector3().copy(_quad.a).multiply(scaleVector).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			b: new QL.ext.Vector3().copy(_quad.b).multiply(scaleVector).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			c: new QL.ext.Vector3().copy(_quad.c).multiply(scaleVector).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2),
			d: new QL.ext.Vector3().copy(_quad.d).multiply(scaleVector).applyEuler(_obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(that.zoom/100).add(center2)
		};

		ctx.beginPath();
		ctx.moveTo(quad2d.a.x,quad2d.a.y);
		ctx.lineTo(quad2d.b.x,quad2d.b.y);
		ctx.lineTo(quad2d.c.x,quad2d.c.y);
		ctx.lineTo(quad2d.d.x,quad2d.d.y);
		ctx.lineTo(quad2d.a.x,quad2d.a.y);
		ctx.closePath();

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

		ctx.strokeStyle = _strokeStyle || '#777';
		var baseColor = new THREE.Color(0x555555);
		/*if(_obj.selected){
			ctx.strokeStyle = "#DC3333";
		}*/

		//ctx.setLineDash(_lineDash || [0]);
		ctx.stroke();

		if(_showCoords){
			ctx.font="12px Arial";
			ctx.fillStyle="#999";

		if(that.editor.indexes.length === 0 || that.editor.indexes.indexOf(index+"")>-1){
				ctx.fillText("a("+(new QL.ext.Vector3()).copy(_quad.a).toVector2(_mod).toArray().join(", ")+"), "+quad2d.a.toArray().join(", "),quad2d.a.x,quad2d.a.y);
				ctx.fillText("b("+(new QL.ext.Vector3()).copy(_quad.b).toVector2(_mod).toArray().join(", ")+"), "+quad2d.b.toArray().join(", "),quad2d.b.x,quad2d.b.y);
				ctx.fillText("c("+(new QL.ext.Vector3()).copy(_quad.c).toVector2(_mod).toArray().join(", ")+"), "+quad2d.c.toArray().join(", "),quad2d.c.x,quad2d.c.y);
				ctx.fillText("d("+(new QL.ext.Vector3()).copy(_quad.d).toVector2(_mod).toArray().join(", ")+"), "+quad2d.d.toArray().join(", "),quad2d.d.x,quad2d.d.y);
			}
			_indexes.push(index);
			_center = objCenter2.clone();
		}


	});

	if(_showCoords){
		ctx.fillText(_indexes.join(", "),_center.x,_center.y);
	}


};


QL.gui.View2D.prototype.drawGrid = function(){

	var ctx = this._layers.grid;

	var center = new QL.ext.Vector2(ctx.canvas.width/2,ctx.canvas.height/2);
	var sizeVector = new QL.ext.Vector2(ctx.canvas.width,ctx.canvas.height);

	center.add(this.offset)

	drawLine(ctx, [
		0, center.y
	],[
		sizeVector.x, center.y
	],[0],'#96DC96');

	drawLine(ctx, [
		center.x, 0
	],[
		center.x, sizeVector.y
	],[0],'#96DC96');

	var step = 10;

	step *=this.zoom/100;

	var defaultLineColor = '#333';
	var segmentColor = '#555';

	for(var yPos = step; center.y - yPos > 0; yPos+=step){
		var lineColor = (parseInt(yPos/step/5) === yPos/step/5) ? segmentColor : defaultLineColor;
		drawLine(ctx, [
			0, center.y-yPos
		],[
			sizeVector.x, center.y - yPos
		],[0],lineColor);
	}

	for(var yPos = step; center.y + yPos < sizeVector.y; yPos+=step){
		var lineColor = (parseInt(yPos/step/5) === yPos/step/5) ? segmentColor : defaultLineColor;
		drawLine(ctx, [
			0, center.y + yPos
		],[
			sizeVector.x, center.y + yPos
		],[0],lineColor);
	}

	for(var xPos = step; center.x - xPos > 0; xPos+=step){
		var lineColor = (parseInt(xPos/step/5) === xPos/step/5) ? segmentColor : defaultLineColor;
		drawLine(ctx, [
			center.x- xPos, 0
		],[
			center.x - xPos, sizeVector.y
		],[0],lineColor);
	}

	for(var xPos = step; center.x + xPos < sizeVector.x; xPos+=step){
		var lineColor = (parseInt(xPos/step/5) === xPos/step/5) ? segmentColor : defaultLineColor;
		drawLine(ctx, [
			center.x + xPos, 0
		],[
			center.x + xPos, sizeVector.y
		],[0],lineColor);
	}
}


QL.gui.View2D.prototype.refresh = function(_entities){

	// update layers width/height
	for( var layer in this._layers){
		this._layers[layer].canvas.width = $(this._layers[layer].canvas.parentNode).width();
		this._layers[layer].canvas.height = $(this._layers[layer].canvas.parentNode).height();
	}

	// refresh grid
	this.drawGrid(this._layers.grid);

	// draw text
	var ctx = this._layers.indicators;
	ctx.font="16px Arial";
	ctx.fillStyle="#999";
	ctx.fillText(this.perspective,15,25);
	ctx.font="14px Arial";
	ctx.fillText(this.zoom,ctx.canvas.width - 65,25);
	ctx.font="12px Arial";
	ctx.fillText(this.offset.toArray().join(", "),ctx.canvas.width - 65, ctx.canvas.height - 15);

	this.center.set(
		$(this._dom).width()/2,
		$(this._dom).height()/2
	);

	this.hitFaces = [];

	var that = this;

	this.scene.children.forEach(function(_obj){
		if(_obj.type === "Mesh"){
			switch(_obj.geometry.type){
				case "BoxGeometry":
					that.drawBox(that._layers.scene,_obj);
				break;
			}
		}
	});

	// draw the selected again
	if(this.scene.selected){
		var boxColor = "#DC3333";
		switch(this.editor.params["obj-mode"]){
			case "move":
				boxColor = "#DC3333";
				break;
			case "scale":
				boxColor = "#DCDC33";
				break;
			case "rotate":
				boxColor = "#33DC33";
				break;
		}
		this.drawBox(that._layers.selection, this.scene.selected,[0],boxColor,this.editor.params.debug);
	}
};
