"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Editor = function(_views, _entities){

	QL.gui.Element.call(this, 'body' );

	this.params = {
		"obj-mode": "move"
	};

	this.actions = []; 

	this.entities = _entities;

	this.keyboard = {};

	// init scene
	this.scene = new QL.ext.Scene();

	// init views
	this.views = [];
	for(var key in _views){
		var viewConf = _views[key];

		switch(viewConf.perspective){
			case "3d":
				this.views.push(new QL.gui.View3D(viewConf, this.scene, this));
				break;
			default:
				this.views.push(new QL.gui.View2D(viewConf, this.scene, this));
				break;
		}
	}

	this.selectView(this.views[0]);

	this.panel = new QL.gui.Panel(".left-panel", this);
	this.toolbar = new QL.gui.Toolbar(".toolbar", this);

	this.scene.addEntities(_entities);

};


QL.gui.Editor.prototype = Object.create( QL.gui.Element );
QL.gui.Editor.prototype.constructor = QL.gui.Editor;

QL.gui.Editor.prototype.init = function(){

	var _editor = this;
	_editor.keyboard = new THREEx.KeyboardState();

	function animStep(){
		requestAnimationFrame( animStep );

		// refresh sub views
		for(var key in _editor.views){
			_editor.views[key].refresh(_editor.entities);
		}

		var keyCombo = '';

		// keyboard interactions
		if($(_editor._dom).find(':focus').length === 0) {

			var interactionVector = new QL.ext.Vector3(0,0,0);

			var force = _editor.keyboard.pressed("shift") ? 10 : 2.5;

			// initial object interaction
			if(_editor.keyboard.pressed("up") 
				|| _editor.keyboard.pressed("down") 
				|| _editor.keyboard.pressed("left") 
				|| _editor.keyboard.pressed("right")
				|| _editor.keyboard.pressed("pageup")
				|| _editor.keyboard.pressed("pagedown")){
				var keys = [];
				if(_editor.keyboard.pressed("up")){
					interactionVector.z -= force;
					keys.push("Up");
				}
				if(_editor.keyboard.pressed("down")){
					interactionVector.z += force;
					keys.push("Down");
				}
				if(_editor.keyboard.pressed("left")){
					interactionVector.x -= force;
					keys.push("Left");
				}
				if(_editor.keyboard.pressed("right")){
					interactionVector.x += force;
					keys.push("Right");
				}
				if(_editor.keyboard.pressed("pageup")){
					interactionVector.y += force;
					keys.push("PgUp");
				}
				if(_editor.keyboard.pressed("pagedown")){
					interactionVector.y -= force;
					keys.push("PgDown");
				}


				if(_editor.scene.selected) {
					switch(_editor.params['obj-mode']){
						case "move":
							QL.ext.interactor.move(_editor.scene.selected, interactionVector);
							break;
						case "scale":
							interactionVector.z = -interactionVector.z;
							QL.ext.interactor.scale(_editor.scene.selected, interactionVector.divideScalar(force*4));
							break;
						case "rotate":
							var rotationVector = new QL.ext.Vector3();
							rotationVector.z = -interactionVector.x;
							rotationVector.x = interactionVector.z;
							rotationVector.y = -interactionVector.y;
							QL.ext.interactor.rotate(_editor.scene.selected, rotationVector);
							break;
					}
				} else {
					if(_editor.activeView.perspective!=="3d"){
						_editor.activeView.offset.x -= interactionVector.x;
						_editor.activeView.offset.y -= interactionVector.z;
						_editor.activeView.zoom += interactionVector.y;
					} else {
						_editor.activeView.camera.position.add(interactionVector);
					}
				}

				_editor.refreshObjectPane();

				keyCombo = keys.join(" + ");
			}
		}

		if(keyCombo !== '' && $(".debug-keys").text() !== keyCombo){
			$(".debug-keys").text(" "+keyCombo);
		}

	}

	// keyboard triggers
	$(this._dom)[0].addEventListener("keyup", function(event){
		var keyCode = event.keyCode;
		var keyCombo = "";

		// desselect and blur on esc
		if(keyCode == 27){
			if($(_editor._dom).find(':focus').length > 0){
				$(_editor._dom).find(":focus").blur();
			} else {
				_editor.scene.selected = false;
				_editor.refreshObjectPane();
			}
			keyCombo = "ESC";
		}

		if($(_editor._dom).find(':focus').length === 0) {

			// focus on object pane
			if(keyCode == "E".charCodeAt(0)){
				$(_editor._dom).find("#object-pane-name").focus();
				keyCombo = "E";
			}
			
			if(keyCode == "T".charCodeAt(0)){
				_editor.activeView.zoom = 100;
				_editor.activeView.offset.set(0, 0);
				keyCombo = "T";
			}

			if(keyCode == "F".charCodeAt(0)){
				$(_editor._dom).find(".fullscreen-toggle").click();
				keyCombo = "F";
			}

			// select prev
			if(keyCode == 219){
				if(event.shiftKey == true){
					_editor.selectNextView(-1);
					keyCombo = "Shift + [";
				} else {
					_editor.selectNext(-1);
					keyCombo = "[";
				}
			}

			// select next on tab
			if(keyCode ==  221){
				if(event.shiftKey == true){
					_editor.selectNextView(1);
					keyCombo = "Shift + ]";
				} else {
					_editor.selectNext(1);
					keyCombo = "]";
				}
			}

			// mode change
			if(keyCode == "M".charCodeAt(0)){
				_editor.changeMode("move");
				keyCombo = "M";
			} else if (keyCode == "R".charCodeAt(0)){
				_editor.changeMode("rotate");
				keyCombo = "R";
			} else if (keyCode == "S".charCodeAt(0)){
				_editor.changeMode("scale");
				keyCombo = "S";
			}

			// object creation
			if(keyCode == "N".charCodeAt(0)){
				_editor.newMesh();
				keyCombo = "N";
			}
			if(keyCode == "C".charCodeAt(0)){
				_editor.cloneMesh();
				keyCombo = "C";
			}
			if(keyCode == "L".charCodeAt(0)){
				_editor.clearScene();
				keyCombo = "L";
			}

		}

		if(keyCombo !== '' && $(".debug-keys").text() !== keyCombo){
			$(".debug-keys").text(" "+keyCombo);
		}
	}, false);

	animStep();

	this.panel.init();
	this.toolbar.init();

	this.panel.refresh();

	
};

QL.gui.Editor.prototype.changeMode = function(mode){
	if(this.params['obj-mode'] !== mode){
		this.params['obj-mode'] = mode;
		$("a.obj-mode-option[data-option-param='obj-mode']").removeClass("selected");
		$("a.obj-mode-option[data-option-param='obj-mode'][data-option-value='"+mode+"']").addClass("selected");
	}
}

QL.gui.Editor.prototype.trackAction = function(action){
	this.actions.push(action);
}

QL.gui.Editor.prototype.selectView = function(view){
	this.activeView = view;
	$(this._dom).find(".views .view").removeClass("selected");
	$(this.activeView._dom).addClass("selected");
}

QL.gui.Editor.prototype.selectNextView = function(direction){
	
	var index = this.views.indexOf(this.activeView);

	index += direction;

	if(direction == 1 && index == this.views.length){
		index = 0;
	} else if (direction == -1 && index == -1){
		index = this.views.length - 1;
	}

	this.selectView(this.views[index]);
}


QL.gui.Editor.prototype.select = function(_objId){
	this.scene.select(_objId);
	this.panel.refresh();
};

QL.gui.Editor.prototype.selectNext = function(direction){
	this.scene.selectNext(direction);
	this.panel.refresh();
}

QL.gui.Editor.prototype.newMesh = function(){
	this.scene.newMesh();
	this.panel.refresh();
};

QL.gui.Editor.prototype.cloneMesh = function(){
	this.scene.cloneMesh(this.activeView.mod);
	this.panel.refresh();
};

QL.gui.Editor.prototype.updateMesh = function(objId){
	if(!objId){
		return false;
	}
	var objRef = this.scene.selected;
	objRef.name = $("#object-pane-name").val();
	objRef.position.x = parseFloat($("#object-pane-pos-x").val());
	objRef.position.y = parseFloat($("#object-pane-pos-y").val());
	objRef.position.z = parseFloat($("#object-pane-pos-z").val());
	// scale
	objRef.scale.x = parseFloat($("#object-pane-scale-x").val());
	objRef.scale.y = parseFloat($("#object-pane-scale-y").val());
	objRef.scale.z = parseFloat($("#object-pane-scale-z").val());
	// rotation
	objRef.rotation.x = QL.etc.Math.radians(parseInt($("#object-pane-rotation-x").val()));
	objRef.rotation.y = QL.etc.Math.radians(parseInt($("#object-pane-rotation-y").val()));
	objRef.rotation.z = QL.etc.Math.radians(parseInt($("#object-pane-rotation-z").val()));

	objRef.material.color.setStyle($("#object-pane-color").val());
	this.panel.refresh();
};


QL.gui.Editor.prototype.clearScene = function(){
	this.scene.clear();
	this.panel.refresh();
};

QL.gui.Editor.prototype.refreshObjectPane = function(){
	if(this.scene.selected){
		$(".object-pane").addClass("active");

		// object pane code here
		$(".object-update-trigger").attr("data-trigger-id", this.scene.selected.id);
		$("#object-pane-name").val(this.scene.selected.name);
		$("#object-pane-pos-x").val(this.scene.selected.position.x);
		$("#object-pane-pos-y").val(this.scene.selected.position.y);
		$("#object-pane-pos-z").val(this.scene.selected.position.z);
		// scale
		$("#object-pane-scale-x").val(this.scene.selected.scale.x);
		$("#object-pane-scale-y").val(this.scene.selected.scale.y);
		$("#object-pane-scale-z").val(this.scene.selected.scale.z);
		// rotation
		$("#object-pane-rotation-x").val(parseInt(QL.etc.Math.degrees(this.scene.selected.rotation.x)));
		$("#object-pane-rotation-y").val(parseInt(QL.etc.Math.degrees(this.scene.selected.rotation.y)));
		$("#object-pane-rotation-z").val(parseInt(QL.etc.Math.degrees(this.scene.selected.rotation.z)));
		$("#object-pane-color").val(this.scene.selected.material.color.getStyle());
	} else {
		$(".object-pane").removeClass("active");
	}
};


