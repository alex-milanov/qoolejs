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
	this.scene = new THREE.Scene();

	// init views
	this.views = {};
	for(var key in _views){
		var viewConf = _views[key];

		switch(viewConf.perspective){
			case "3d":
				this.views[key] = new QL.gui.View3D(viewConf, this.scene, this);
				break;
			default:
				this.views[key] = new QL.gui.View2D(viewConf, this.scene, this);
				break;
		}
	}

	this.activeView = this.views['tl'];

	this.panel = new QL.gui.Panel(".left-panel", this);
	this.toolbar = new QL.gui.Toolbar(".toolbar", this);

	this.views.tr.addEntities(_entities);

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
			

			// initial object interaction
			if(_editor.keyboard.pressed("up") 
				|| _editor.keyboard.pressed("down") 
				|| _editor.keyboard.pressed("left") 
				|| _editor.keyboard.pressed("right")){
				var keys = [];
				if(_editor.keyboard.pressed("up")){
					_editor.scene.selected.position[_editor.activeView.mod.v] -= _editor.activeView.mod.yD*5;
					keys.push("up");
				}
				if(_editor.keyboard.pressed("down")){
					_editor.scene.selected.position[_editor.activeView.mod.v] += _editor.activeView.mod.yD*5;
					keys.push("down");
				}
				if(_editor.keyboard.pressed("left")){
					_editor.scene.selected.position[_editor.activeView.mod.u] -= _editor.activeView.mod.xD*5;
					keys.push("left");
				}
				if(_editor.keyboard.pressed("right")){
					_editor.scene.selected.position[_editor.activeView.mod.u] += _editor.activeView.mod.xD*5;
					keys.push("right");
				}
				keyCombo = keys.join(" + ");
			}
		}

		if(keyCombo !== '' && $(".debug-keys").text() !== keyCombo){
			$(".debug-keys").text(keyCombo);
		}

	}

	// keyboard triggers
	$(this._dom)[0].addEventListener("keyup", function(event){
		if($(_editor._dom).find(':focus').length === 0) {

			var keyCode = event.keyCode;
			var keyCombo = "";

			// desselect and blur on esc
			if(keyCode == 27){
				_editor.scene.selected = false;
				$(_editor._dom).find(":focus").blur();
				keyCombo = "ESC";
			}

			// select prev
			if(keyCode == 33 && event.shiftKey == true){
				_editor.selectNext(-1);
				keyCombo = "Shift + PgUp";
			}

			// select next on tab
			if(keyCode == 34 && event.shiftKey == true){
				_editor.selectNext(1);
				keyCombo = "Shift + PgDwn";
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

			if(keyCombo !== '' && $(".debug-keys").text() !== keyCombo){
				$(".debug-keys").text(keyCombo);
			}
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

QL.gui.Editor.prototype.select = function(_objId){

	if(!this.scene.selected || this.scene.selected.id !== _objId){
		this.scene.selected = this.scene.getObjectById(_objId);
	} else {
		this.scene.selected = false;
	}

/*
	var _editor = this;
	this.scene.children.forEach(function(_obj){
		if(_editor.scene.selected !== false && _obj.type=="Mesh" && _obj.id == _objId) {
			_obj.selected = true;
		} else {
			_obj.selected = false;
		}
	});
*/

	this.panel.refresh();
};

QL.gui.Editor.prototype.selectNext = function(direction){
	if(this.scene.children.length == 0){
		return false;
	}

	if(!direction)
		direction = 1;

	var index = this.scene.children.indexOf(this.scene.selected);

	var indexToBeSelected = index + direction;
	
	var nextToBeSelected = false;
	var iterations = 0;
	while(!(nextToBeSelected && nextToBeSelected.id && nextToBeSelected.type == "Mesh") && (iterations < this.scene.children.length)){
		
		nextToBeSelected = this.scene.children[indexToBeSelected];

		if((direction == 1 && indexToBeSelected < this.scene.children.length - 1) || 
			(direction == -1 && indexToBeSelected > 0)){
			indexToBeSelected+= direction;
		} else if (direction == 1 ) {
			indexToBeSelected = 0;
		} else {
			indexToBeSelected = this.scene.children.length - 1;
		}
		iterations++;
	}

	if(nextToBeSelected && nextToBeSelected.id && nextToBeSelected.type == "Mesh")
		this.scene.selected = nextToBeSelected;

	this.panel.refresh();
}


QL.gui.Editor.prototype.newMesh = function(){
	var meshName = "Block "+this.scene.children.length;
	this.views.tr.addEntities([
		{
			name: (meshName),
			type: "block",
			start: [-20,-20,-20],
			finish: [20,20,20],
			color: 0x113311
		},
	]);
	this.select(this.scene.getObjectByName(meshName).id);
	this.panel.refresh();
};

QL.gui.Editor.prototype.cloneMesh = function(){

	if(!this.scene.selected){
		return false;
	}

	var lastAction = this.actions[this.actions.length-1];

	var mesh = this.scene.selected.clone();
	mesh.name = "Block "+this.scene.children.length;
 
	mesh.position.set(0,0,0);
	mesh.position[this.activeView.mod.w] = this.scene.selected.position[this.activeView.mod.w];

	this.scene.add(mesh);
	this.select(this.scene.getObjectByName(mesh.name).id);
	this.panel.refresh();
};

QL.gui.Editor.prototype.updateMesh = function(objId){
	if(!objId){
		return false;
	}
	var objRef = this.scene.getObjectById(objId);
	objRef.name = $("#object-pane-name").val();
	objRef.position.x = parseInt($("#object-pane-pos-x").val());
	objRef.position.y = parseInt($("#object-pane-pos-y").val());
	objRef.position.z = parseInt($("#object-pane-pos-z").val());
	this.panel.refresh();
};


QL.gui.Editor.prototype.clearScene = function(){
	this.scene.children = [];
	this.scene.selected = null;
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
		$("#object-pane-color").val("");
	} else {
		$(".object-pane").removeClass("active");
	}
};


