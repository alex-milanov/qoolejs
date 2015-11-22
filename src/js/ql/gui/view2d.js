"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }

QL.gui.View2D = function(_conf, _scene, _editor){
	this._dom = $(_conf.dom)[0];
	//this.ctx = this.canvas.getContext("2d");

	this.layers = {
		grid: new iblokz.gui.Grid($(this._dom).find('.grid-layer')[0]),
		scene: new iblokz.gui.Canvas($(this._dom).find('.scene-layer')[0]),
		selection: new iblokz.gui.Canvas($(this._dom).find('.selection-layer')[0]),
		indicators: new iblokz.gui.Canvas($(this._dom).find('.indicators-layer')[0])
	};

	this.toBeRefreshed = ["grid", "scene", "selection", "indicators"];

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
	this.selected = false;

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

		var old = _.clone(_view.selected);

		var selected = false;
		var hits = 0;
		_view.hitFaces.forEach(function(hitFace){
			if(hitFace.triangle.containsPoint(hitPos.toVector3(_view.mod))) {
				hits++;

				if(selected === false || hitFace.position[_view.mod.w] > selected.position[_view.mod.w]){

					if(hitFace.objId === old.objId)
						return true;

					selected = _.clone(hitFace);
				}
			}
		});

		_view.editor.select(selected.objId);
		//this.needRefreshing("scene","interaction");

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
					if(_view.selected === false)
						return;

					var objectChanged = false;

					var interactionVector = changeVector.clone().sub(_view.interaction.last).toVector3(_view.mod);

					switch(_view.editor.params["obj-mode"]){
						case "move":

							//QL.ext.interactor.move(_view.scene.selected, interactionVector);
							_view.editor.interact("move",interactionVector);
							break;
						case "scale":
							interactionVector.z = -interactionVector.z;
							//QL.ext.interactor.scale(_view.scene.selected, interactionVector.divideScalar(10));
							_view.editor.interact("scale",interactionVector.divideScalar(10));
							break;
						case "rotate":

							var oldRotation = _view.scene.selected.rotation.clone();

							var mousePos3 = mousePos.clone().divideScalar(_view.zoom/100).sub(_view.center).toVector3(_view.mod);
							mousePos3[_view.mod.w] = _view.scene.selected.position[_view.mod.w];
							//console.log(mousePos3);
							//QL.ext.interactor.lookAt(_view.scene.selected, mousePos3);
							_view.editor.interact("lookAt",mousePos3);
							
							break;
					}
					_view.interaction.last = changeVector.clone();
					break;
				case 2:
					_view.offset.sub(changeVector.clone().sub(_view.interaction.last))
					_view.interaction.last = changeVector.clone();
					_view.needRefreshingAll();
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

		_view.needRefreshingAll();

	});

};


QL.gui.View2D.prototype.drawBox = function(ctx, obj, _lineDash, _strokeStyle, _showCoords){

	var _mod = this.mod;
	var scope = this;

	var _center = [];
	var _indexes = [];

	var scaleVector = new QL.ext.Vector3().copy(obj.scale);
	var center2 = this.center.clone().add(scope.offset);

	var objPos3 = new QL.ext.Vector3().copy(obj.position);

	var objCenter2 = objPos3.clone().toVector2(_mod).add(center2);

	if(obj.geometry.quads) {
		obj.geometry.quads.forEach(function(_quad, index){

			//var scaleVector2 = scaleVector.toVector2(_mod);
			// TODO: Impl a check whether a face should be displayed or not
					
			var quad2d = {
				a: new QL.ext.Vector3().copy(_quad.a).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2),
				b: new QL.ext.Vector3().copy(_quad.b).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2),
				c: new QL.ext.Vector3().copy(_quad.c).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2),
				d: new QL.ext.Vector3().copy(_quad.d).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2)
			};

			ctx.beginPath();
			ctx.moveTo(quad2d.a.x,quad2d.a.y);
			ctx.lineTo(quad2d.b.x,quad2d.b.y);
			ctx.lineTo(quad2d.c.x,quad2d.c.y);
			ctx.lineTo(quad2d.d.x,quad2d.d.y);
			ctx.lineTo(quad2d.a.x,quad2d.a.y);
			ctx.closePath();

			scope.hitFaces.push({
				triangle: new THREE.Triangle(
					quad2d.a.toVector3(_mod),
					quad2d.b.toVector3(_mod),
					quad2d.c.toVector3(_mod)
				),
				position: obj.position.clone(),
				objId: obj.id
			});
			scope.hitFaces.push({
				triangle: new THREE.Triangle(
					quad2d.b.toVector3(_mod),
					quad2d.c.toVector3(_mod),
					quad2d.d.toVector3(_mod)
				),
				position: obj.position.clone(),
				objId: obj.id
			});

			ctx.strokeStyle = _strokeStyle || '#777';
			var baseColor = new THREE.Color(0x555555);
			ctx.stroke();

			if(_showCoords){
				ctx.font="12px Arial";
				ctx.fillStyle="#999";

			if(scope.editor.indexes.length === 0 || scope.editor.indexes.indexOf(index+"")>-1){
					ctx.fillText("a("+(new QL.ext.Vector3()).copy(_quad.a).toVector2(_mod).toArray().join(", ")+"), "+quad2d.a.toArray().join(", "),quad2d.a.x,quad2d.a.y);
					ctx.fillText("b("+(new QL.ext.Vector3()).copy(_quad.b).toVector2(_mod).toArray().join(", ")+"), "+quad2d.b.toArray().join(", "),quad2d.b.x,quad2d.b.y);
					ctx.fillText("c("+(new QL.ext.Vector3()).copy(_quad.c).toVector2(_mod).toArray().join(", ")+"), "+quad2d.c.toArray().join(", "),quad2d.c.x,quad2d.c.y);
					ctx.fillText("d("+(new QL.ext.Vector3()).copy(_quad.d).toVector2(_mod).toArray().join(", ")+"), "+quad2d.d.toArray().join(", "),quad2d.d.x,quad2d.d.y);
				}
				_indexes.push(index);
				_center = objCenter2.clone();
			}
		});
	} else {
		obj.geometry.faces.forEach(function(face, index){


			var face2d = {
				a: new QL.ext.Vector3().copy(obj.geometry.vertices[face.a]).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2),
				b: new QL.ext.Vector3().copy(obj.geometry.vertices[face.b]).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2),
				c: new QL.ext.Vector3().copy(obj.geometry.vertices[face.c]).multiply(scaleVector).applyEuler(obj.rotation).add(objPos3).toVector2(_mod).multiplyScalar(scope.zoom/100).add(center2)
			};


			ctx.beginPath();
			ctx.moveTo(face2d.a.x,face2d.a.y);
			ctx.lineTo(face2d.b.x,face2d.b.y);
			ctx.lineTo(face2d.c.x,face2d.c.y);
			ctx.lineTo(face2d.a.x,face2d.a.y);
			ctx.closePath();


			ctx.strokeStyle = _strokeStyle || '#777';
			var baseColor = new THREE.Color(0x555555);

			ctx.stroke();

			scope.hitFaces.push({
				triangle: new THREE.Triangle(
					face2d.a.toVector3(_mod),
					face2d.b.toVector3(_mod),
					face2d.c.toVector3(_mod)
				),
				position: obj.position.clone(),
				objId: obj.id
			});


		});
	}

	if(_showCoords){
		ctx.fillText(_indexes.join(", "),_center.x,_center.y);
	}


};

QL.gui.View2D.prototype.needRefreshing = function(){
	var args = Array.prototype.slice.call(arguments);
	args.forEach(function(arg){
		if(this.toBeRefreshed.indexOf(arg)==-1){
			this.toBeRefreshed.push(arg);
		}
	})
}

QL.gui.View2D.prototype.needRefreshingAll = function(){
	this.toBeRefreshed = ["grid", "scene", "selection", "indicators"];
}

QL.gui.View2D.prototype.init = function(){
	this.needRefreshingAll();
}

QL.gui.View2D.prototype.refresh = function(scene){

	//
	for( var layer in this.layers){

		this.layers[layer].zoom = this.zoom;
		this.layers[layer].offset = this.offset;
		this.layers[layer].refresh();
		// TODO: impl need refreshing
		/*
		if(this.toBeRefreshed.indexOf(layer)>-1){
			this.layers[layer].refresh();
			this.toBeRefreshed.splice(this.toBeRefreshed.indexOf(layer),1);
			console.log(this.perspective + " view, "+layer+" layer refreshed");
		}
		*/
	}

	// draw text
	var ctx = this.layers.indicators.ctx;
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

	scene.children.forEach(function(_obj){
		if(_obj.type === "Mesh"){
			switch(_obj.geometry.type){
				default:
					that.drawBox(that.layers.scene.ctx,_obj);
				break;
			}
		}
	});

	// draw the selected again
	if(scene.selected){
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
		this.drawBox(that.layers.selection.ctx, scene.selected,[0],boxColor,this.editor.params.debug);
		this.selected = {
			objId: scene.selected.id,
			position: scene.selected.position.clone()
		}
	} else {
		this.selected = false;
	}
};
