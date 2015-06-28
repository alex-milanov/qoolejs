"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Editor = function(_views, _entities){

	

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


	this.views["tr"].addEntities(_entities);

}


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
	})

	_editor.updateToolbar();
}

QL.gui.Editor.prototype.updateToolbar = function(){
	var $panel = $(".left-panel .entities");
	$panel.html("");
	var _editor = this;
	this.scene.children.forEach(function(_entity){
		var _el = $("<li></li>");
		var _title = _entity.type;
		if(_entity.geometry && _entity.geometry.type){
			_title += "[ "+_entity.geometry.type+" ]"
		}
		_el.text(_title);
		_el.attr("data-obj-id",_entity.id);
		if(_entity.selected){
			_el.addClass("selected");
		}

		if(_entity.type === "Mesh"){
			_el.click(function(){
				_editor.select($(this).attr("data-obj-id"));
			})
		}

		$panel.append(_el);
	})
}

QL.gui.Editor.prototype.init = function(){

	var _editor = this;

	function animStep(){
		requestAnimationFrame( animStep );
		for(var key in _editor.views){
			_editor.views[key].refresh(_editor.entities);
		}
	}

	animStep();

	_editor.updateToolbar();
	$(".panel-trigger").click(function(){
		$(this).toggleClass("selected")
		$(".left-panel").toggleClass("opened")
	})
	$(".fullscreen-trigger").click(function(){
		$(this).toggleClass("selected")
		$(".canvas-tr").toggleClass("fullscreen")
	})

}