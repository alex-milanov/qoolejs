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

			var interactionVector = [0,0];

			var force = _editor.keyboard.pressed("shift") ? 10 : 2.5;

			// initial object interaction
			if(_editor.keyboard.pressed("up") 
				|| _editor.keyboard.pressed("down") 
				|| _editor.keyboard.pressed("left") 
				|| _editor.keyboard.pressed("right")){
				var keys = [];
				if(_editor.keyboard.pressed("up")){
					interactionVector[1] -= force;
					keys.push("up");
				}
				if(_editor.keyboard.pressed("down")){
					interactionVector[1] += force;
					keys.push("down");
				}
				if(_editor.keyboard.pressed("left")){
					interactionVector[0] -= force;
					keys.push("left");
				}
				if(_editor.keyboard.pressed("right")){
					interactionVector[0] += force;
					keys.push("right");
				}

				switch(_editor.params['obj-mode']){
					case "move":
						_editor.scene.selected.position[_editor.activeView.mod.u] += interactionVector[0]*_editor.activeView.mod.xD;
						_editor.scene.selected.position[_editor.activeView.mod.v] += interactionVector[1]*_editor.activeView.mod.yD;
						break;
					case "scale":
						_editor.scene.selected.geometry.scale(
							_editor.activeView.mod, 
							new QL.ext.Vector2(interactionVector[0], interactionVector[1])
						)
						break;
				}

				_editor.refreshObjectPane();

				keyCombo = keys.join(" + ");
			}
		}

		if(keyCombo !== '' && $(".debug-keys").text() !== keyCombo){
			$(".debug-keys").text(keyCombo);
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
			if(keyCode == 33 && event.shiftKey == true){
				if(event.altKey == true){
					_editor.selectNextView(-1);
					keyCombo = "Shift + ALt + PgUp";
				} else {
					_editor.selectNext(-1);
					keyCombo = "Shift + PgUp";
				}
			}

			// select next on tab
			if(keyCode == 34 && event.shiftKey == true){
				if(event.altKey == true){
					_editor.selectNextView(1);
					keyCombo = "Shift + ALt + PgDwn";
				} else {
					_editor.selectNext(1);
					keyCombo = "Shift + PgDwn";
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
			$(".debug-keys").text(keyCombo);
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
	$(this._dom).find(".views .canvas").removeClass("selected");
	$(this.activeView.canvas).addClass("selected");
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
	objRef.position.x = parseInt($("#object-pane-pos-x").val());
	objRef.position.y = parseInt($("#object-pane-pos-y").val());
	objRef.position.z = parseInt($("#object-pane-pos-z").val());
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
		$("#object-pane-color").val(this.scene.selected.material.color.getStyle());
	} else {
		$(".object-pane").removeClass("active");
	}
};


