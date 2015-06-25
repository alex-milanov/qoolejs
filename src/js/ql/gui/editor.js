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
				this.views[key] = new QL.gui.View3D(viewConf, this.scene);
				break;
			default:
				this.views[key] = new QL.gui.View2D(viewConf);
				break;
		}
	}


	this.views["tr"].addEntities(_entities);

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
}