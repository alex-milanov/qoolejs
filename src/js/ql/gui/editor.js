"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Editor = function(_views, _entities){

	QL.gui.Element.call( 'body' );

	this.params = {
		"obj-mode": "move"
	};

	this.entities = _entities;

	this.keyboard = new THREEx.KeyboardState();

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

	this.panel = new QL.gui.Panel(".left-panel", this);
	this.toolbar = new QL.gui.Toolbar(".toolbar", this);

	this.views.tr.addEntities(_entities);

};


QL.gui.Editor.prototype = Object.create( QL.gui.Element );
QL.gui.Editor.prototype.constructor = QL.gui.Editor;

QL.gui.Editor.prototype.init = function(){

	var _editor = this;

	function animStep(){
		requestAnimationFrame( animStep );
		for(var key in _editor.views){
			_editor.views[key].refresh(_editor.entities);
		}
	}

	animStep();

	this.panel.init();
	this.toolbar.init();

	this.panel.refresh();
	
};

QL.gui.Editor.prototype.select = function(_objId){

	if(!this.scene.selected || this.scene.selected.id !== _objId){
		this.scene.selected = this.scene.getObjectById(_objId);
	} else {
		this.scene.selected = false;
	}

	var _editor = this;
	this.scene.children.forEach(function(_obj){
		if(_editor.scene.selected !== false && _obj.type=="Mesh" && _obj.id == _objId) {
			_obj.selected = true;
		} else {
			_obj.selected = false;
		}
	});


	this.panel.refresh();
};



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

QL.gui.Editor.prototype.duplicate = function(){

	if(!this.scene.selected){
		return false;
	}

	var mesh = this.scene.selected.clone();
	mesh.name = "Block "+this.scene.children.length;
 
	mesh.position.set(0,0,0);

	this.scene.add(mesh);
	this.select(this.scene.getObjectByName(mesh.name).id);
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

QL.gui.Editor.prototype.objectUpdate = function(objId){
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
