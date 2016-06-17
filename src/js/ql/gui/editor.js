'use strict';

import THREE from 'three';
import jQuery from 'jquery';
import _ from 'lodash';

import iblokz from '../../iblokz';
import ext from '../ext';
import etc from '../etc';
import Element from './element';
import Toolbar from './toolbar';
import Panel from './panel';
import View3D from './view3d';
import View2D from './view2d';


var Editor = function(_views, _entities){

	Element.call(this, 'body' );

	this.params = {
		"obj-mode": "move"
	};

	this.history = new etc.History();

	this.entities = _entities;

	this.keyboard = {};

	// init scene
	this.scene = new ext.Scene();

	// init views
	this.views = [];
	for(var key in _views){
		var viewConf = _views[key];

		switch(viewConf.perspective){
			case "3d":
				this.views.push(new View3D(viewConf, this.scene, this));
				break;
			default:
				this.views.push(new View2D(viewConf, this.scene, this));
				break;
		}
	}

	this.selectView(this.views[0]);

	this.panel = new Panel(".panel.left", this);
	this.toolbar = new Toolbar(".toolbar", this);

	this.scene.addEntities(_entities);

};


Editor.prototype = Object.create( Element );
Editor.prototype.constructor = Editor;

Editor.prototype.init = function(){

	var _editor = this;
	_editor.keyboard = {};// new THREEx.KeyboardState();

	function animStep(){
		requestAnimationFrame( animStep );

		// refresh sub views
		for(var key in _editor.views){
			_editor.views[key].refresh(_editor.scene);
		}

		var keyCombo = '';

		// keyboard interactions
		/*
		if(jQuery(_editor.dom).find(':focus').length === 0) {

			var interactionVector = new ext.Vector3(0,0,0);

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
							//ext.interact.move(_editor.scene.selected, interactionVector);
							//_editor.interact("move", interactionVector);
							break;
						case "scale":
							interactionVector.z = -interactionVector.z;
							interactionVector.divideScalar(20/force*2.5);
							break;
						case "rotate":
							var rotationVector = new ext.Vector3();
							rotationVector.z = -interactionVector.x;
							rotationVector.x = interactionVector.z;
							rotationVector.y = -interactionVector.y;
							interactionVector.copy(rotationVector);
							break;
					}
					_editor.interact(_editor.params['obj-mode'], interactionVector);
				} else {
					if(_editor.activeView.perspective!=="3d"){
						_editor.activeView.offset.x -= interactionVector.x;
						_editor.activeView.offset.y -= interactionVector.z;
						_editor.activeView.zoom += interactionVector.y;

						_editor.activeView.needRefreshingAll();
					} else {
						_editor.activeView.camera.position.add(interactionVector);

					}
				}

				_editor.refreshObjectPane();

				keyCombo = keys.join(" + ");
			}
		}
		*/

		if(keyCombo !== '' && jQuery(".debug-keys").text() !== keyCombo){
			jQuery(".debug-keys").text(" "+keyCombo);
		}

	}

	// keyboard triggers
	jQuery(this.dom)[0].addEventListener("keyup", function(event){
		var keyCode = event.keyCode;
		var keyCombo = "";

		// desselect and blur on esc
		if(keyCode == 27){
			if(jQuery(_editor.dom).find(':focus').length > 0){
				jQuery(_editor.dom).find(":focus").blur();
			} else {
				_editor.scene.selected = false;
				_editor.refreshObjectPane();
			}
			keyCombo = "ESC";
		}

		if(jQuery(_editor.dom).find(':focus').length === 0) {

			// undo/redo
			if(event.ctrlKey && keyCode == "Z".charCodeAt(0)){
				_editor.history.undo();
				keyCombo = "Ctrl+Z";
			}
			if(event.ctrlKey && keyCode == "Y".charCodeAt(0)){
				_editor.history.redo();
				keyCombo = "Ctrl+Y";
			}

			// focus on object pane
			if(keyCode == "E".charCodeAt(0)){
				jQuery(_editor.dom).find("#object-pane-name").focus();
				keyCombo = "E";
			}

			if(keyCode == "T".charCodeAt(0)){
				_editor.activeView.zoom = 100;
				_editor.activeView.offset.set(0, 0);
				keyCombo = "T";
			}

			if(keyCode == "F".charCodeAt(0)){
				jQuery(_editor.activeView.dom).find(".fullscreen-toggle").click();
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
				_editor.cloneObject();
				keyCombo = "C";
			}
			if(keyCode == "L".charCodeAt(0)){
				_editor.clearScene();
				keyCombo = "L";
			}

		}

		if(keyCombo !== '' && jQuery(".debug-keys").text() !== keyCombo){
			jQuery(".debug-keys").text(" "+keyCombo);
		}
	}, false);

	animStep();

	this.panel.init();
	this.toolbar.init();

	this.views.forEach(function(view){
		view.init();
	});

	this.panel.refresh();

};

Editor.prototype.changeMode = function(mode){
	if(this.params['obj-mode'] !== mode){
		this.params['obj-mode'] = mode;
		jQuery("a.obj-mode-option[data-option-param='obj-mode']").removeClass("selected");
		jQuery("a.obj-mode-option[data-option-param='obj-mode'][data-option-value='"+mode+"']").addClass("selected");
	}
}

Editor.prototype.interact = function(action, v3){

	var preMatrix = new THREE.Matrix4();
	var selected = this.scene.selected;

	preMatrix.copy( selected.matrix );

	// apply action
	ext.interact[action](selected, v3);

	var editor = this;

	//-> setTimeOut

	if ( preMatrix.equals( selected.matrix ) === false ) {

		( function ( matrix1, matrix2 ) {

			editor.history.add(
				function () {
					matrix1.decompose( selected.position, selected.quaternion, selected.scale );
					//signals.objectChanged.dispatch( object );
				},
				function () {
					matrix2.decompose( selected.position, selected.quaternion, selected.scale );
					//signals.objectChanged.dispatch( object );
				},
				action + " " + selected.id // title
			);

		} )( preMatrix.clone(), selected.matrix.clone() );

	}

}

Editor.prototype.selectView = function(view){
	this.activeView = view;
	jQuery(this.dom).find(".views .view").removeClass("selected");
	jQuery(this.activeView.dom).addClass("selected");
}

Editor.prototype.selectNextView = function(direction){

	var index = this.views.indexOf(this.activeView);

	index += direction;

	if(direction == 1 && index == this.views.length){
		index = 0;
	} else if (direction == -1 && index == -1){
		index = this.views.length - 1;
	}

	this.selectView(this.views[index]);
}


Editor.prototype.select = function(_objId){
	this.scene.select(_objId);
	this.panel.refresh();
};

Editor.prototype.selectNext = function(direction){
	this.scene.selectNext(direction);
	this.panel.refresh();
}

Editor.prototype.newMesh = function(){
	var mesh = this.scene.newMesh();
	this.panel.refresh();

	var action = "new mesh" + mesh.id;

	editor.history.add(
		function () {
			editor.scene.remove(mesh);
			editor.scene.selected = null;
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		function () {
			editor.scene.add(mesh);
			editor.scene.selected = null;
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		action
	);
};

Editor.prototype.cloneObject = function(){

	if(!this.scene.selected)
		return false;

	var mesh = this.scene.cloneObject(this.activeView.mod);
	this.panel.refresh();

	var action = "clone object" + mesh.id;

	editor.history.add(
		function () {
			editor.scene.remove(mesh);
			editor.scene.selected = null;
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		function () {
			editor.scene.add(mesh);
			editor.scene.selected = null;
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		action
	);
};

Editor.prototype.updateObject = function(objId){

	if(!objId){
		return false;
	}

	var selected = this.scene.selected;

	var oldObjState = {
		name: selected.name,
		matrix: selected.matrix.clone(),
		material: selected.material.clone()
	};

	selected.name = jQuery("#object-pane-name").val();
	selected.position.x = parseFloat(jQuery("#object-pane-pos-x").val());
	selected.position.y = parseFloat(jQuery("#object-pane-pos-y").val());
	selected.position.z = parseFloat(jQuery("#object-pane-pos-z").val());
	// scale
	selected.scale.x = parseFloat(jQuery("#object-pane-scale-x").val());
	selected.scale.y = parseFloat(jQuery("#object-pane-scale-y").val());
	selected.scale.z = parseFloat(jQuery("#object-pane-scale-z").val());
	// rotation
	selected.rotation.x = etc.math.radians(parseInt(jQuery("#object-pane-rotation-x").val()));
	selected.rotation.y = etc.math.radians(parseInt(jQuery("#object-pane-rotation-y").val()));
	selected.rotation.z = etc.math.radians(parseInt(jQuery("#object-pane-rotation-z").val()));

	selected.updateMatrix();

	selected.material.color.setStyle(jQuery("#object-pane-color").val());
	this.panel.refresh();

	var action = "update object "+ selected.id;

	(function(obj1, obj2){
		editor.history.add(
			function () {
				obj1.matrix.decompose( selected.position, selected.quaternion, selected.scale );
				selected.name = obj1.name;
				selected.material.copy(obj1.material);
				editor.panel.refresh();
				//signals.objectChanged.dispatch( object );
			},
			function () {
				obj2.matrix.decompose( selected.position, selected.quaternion, selected.scale );
				selected.name = obj2.name;
				selected.material.copy(obj2.material);
				editor.panel.refresh();

			},
			action
		);
	}) (oldObjState, {
		name: selected.name,
		matrix: selected.matrix.clone(),
		material: selected.material.clone()
	})

};

Editor.prototype.loadScene = function(){

	var fileLoader = jQuery("<input type='file' />");

	var scope = this;

	jQuery(fileLoader).change(function(){
		var file = this.files[0];
		var fr = new FileReader();
		fr.onload = receivedText;
		fr.readAsText(file);
		function receivedText(e) {
			var data = JSON.parse(e.target.result);
			scope.scene.load(data);
			scope.history.clear();
			scope.panel.refresh();
			jQuery("#scene-title").text(file.name);
		}
	});

	jQuery(fileLoader).click();

}

Editor.prototype.saveScene = function(){
	var blob = new Blob([JSON.stringify(this.scene.toJSON())], {type: "text/plain;charset=utf-8"});
	window.saveAs(blob, "scene.json");
}

Editor.prototype.newScene  = function(){
	this.clearScene();
	this.history.clear();
	jQuery("#scene-title").text("Untitled");
}

Editor.prototype.clearScene = function(){
	var children = this.scene.children.slice();

	this.scene.clear();
	this.panel.refresh();

	var editor = this;

	var action = "clear scene";

	editor.history.add(
		function () {
			children.forEach(function(child){
				if(child.type === "Mesh"){
					editor.scene.children.push(child);
				}
			})
			editor.scene.selected = null;
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		function () {
			editor.scene.clear();
			editor.panel.refresh();
			//signals.objectChanged.dispatch( object );
		},
		action
	);

};

Editor.prototype.undo = function(){
	this.history.undo();
}

Editor.prototype.redo = function(){
	this.history.redo();
}

Editor.prototype.refreshObjectPane = function(){
	if(this.scene.selected){
		jQuery("#object-pane").addClass("active");

		// object pane code here
		jQuery(".update-object-trigger").attr("data-trigger-id", this.scene.selected.id);
		jQuery("#object-pane-name").val(this.scene.selected.name);
		jQuery("#object-pane-pos-x").val(this.scene.selected.position.x);
		jQuery("#object-pane-pos-y").val(this.scene.selected.position.y);
		jQuery("#object-pane-pos-z").val(this.scene.selected.position.z);
		// scale
		jQuery("#object-pane-scale-x").val(this.scene.selected.scale.x);
		jQuery("#object-pane-scale-y").val(this.scene.selected.scale.y);
		jQuery("#object-pane-scale-z").val(this.scene.selected.scale.z);
		// rotation
		jQuery("#object-pane-rotation-x").val(parseInt(etc.math.degrees(this.scene.selected.rotation.x)));
		jQuery("#object-pane-rotation-y").val(parseInt(etc.math.degrees(this.scene.selected.rotation.y)));
		jQuery("#object-pane-rotation-z").val(parseInt(etc.math.degrees(this.scene.selected.rotation.z)));
		jQuery("#object-pane-color").val("#"+this.scene.selected.material.color.getHexString());
	} else {
		jQuery("#object-pane").removeClass("active");
	}
};

export default Editor;
