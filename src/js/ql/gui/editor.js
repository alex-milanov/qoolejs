"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Editor = function(_views, _entities){

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

	this.views.tr.addEntities(_entities);

};


QL.gui.Editor.prototype.select = function(_objId){

	if(!this.scene.selected || this.scene.selected.id !== _objId){
		this.scene.selected = this.scene.getObjectById(_objId);
	} else {
		this.scene.selected = false;
	}

	//console.log(this.scene.selected);

	var _editor = this;
	this.scene.children.forEach(function(_obj){
		if(_editor.scene.selected !== false && _obj.type=="Mesh" && _obj.id == _objId) {
			_obj.selected = true;
		} else {
			_obj.selected = false;
		}
	});
	
	
	_editor.refreshLeftPanel();
};

QL.gui.Editor.prototype.refreshLeftPanel = function(){
	var $meshEntities = $(".entities#mesh-entities");
	$meshEntities.html("");
	var _editor = this;
	this.scene.children.forEach(function(_entity){
		var _el = $("<li></li>");
		var _name = '';
		if(_entity.name){
			_name = _entity.name;
		} else {
			_name = _entity.type;
			if(_entity.geometry && _entity.geometry.type){
				_name += "[ "+_entity.geometry.type+" ]";
			}
		}
		_el.text(_name);
		_el.attr("data-obj-id",_entity.id);
		if(_entity.selected){
			_el.addClass("selected");
		}

		if(_entity.type === "Mesh"){
			_el.click(function(){
				_editor.select(parseInt($(this).attr("data-obj-id")));
			});
		}

		switch(_entity.type){
			case "Mesh":
				$meshEntities.append(_el);
				break;
		}
	});
	this.refreshObjectPane();
};

QL.gui.Editor.prototype.init = function(){

	var _editor = this;

	function animStep(){
		requestAnimationFrame( animStep );
		for(var key in _editor.views){
			_editor.views[key].refresh(_editor.entities);
		}
	}

	animStep();

	_editor.refreshLeftPanel();

	$("body").on("click","a[class*='-toggle']",function(){
		$(this).toggleClass("toggled");
		var $toggleRef = $($(this).data("toggle-ref"));
		var _toggleClass = $(this).data("toggle-class");
		var _toggleParam = $(this).data("toggle-param");
		$toggleRef.toggleClass(_toggleClass);
		if(_toggleParam !== ""){
			_editor.params[_toggleParam] = !_editor.params[_toggleParam];
		}
	});

	$("body").on("click","a[class*='-trigger']",function(){
		var _triggerMethod = $(this).data("trigger-method");
		if(typeof _editor[_triggerMethod] !== "undefined"){
			if($(this).data("trigger-id")){
				_editor[_triggerMethod]($(this).data("trigger-id"));
			}
			_editor[_triggerMethod]();
		}
	});


	$("body").on("click","a[class*='-option']",function(_ev){
		$("a[class*='-option']").removeClass("selected");
		$(this).addClass("selected");

		var _optionParam = $(this).data("option-param");
		var _optionValue = $(this).data("option-value");

		_editor.params[_optionParam] = _optionValue;
	});

	_editor.indexes = [];
	$(".toolbar .indexes").keyup(function(){
		_editor.indexes = $(this).val().split(",");
		console.log(_editor.indexes);
	});
};

QL.gui.Editor.prototype.newMesh = function(){
	var meshName = window.prompt("Name");
	this.views.tr.addEntities([
		{
			name: (meshName || "Block"),
			type: "block",
			start: [-20,-20,-20],
			finish: [20,20,20],
			color: 0x113311
		},
	]);
	this.refreshLeftPanel();
};

QL.gui.Editor.prototype.clearScene = function(){
	this.scene.children = [];
	this.refreshLeftPanel();
};

QL.gui.Editor.prototype.refreshObjectPane = function(){
	if(this.scene.selected){
		// object pane code here
		$(".object-update-trigger").attr("data-trigger-id", this.scene.selected.id);
		$("#object-pane-name").val(this.scene.selected.name)
		$("#object-pane-pos-x").val(this.scene.selected.position.x)
		$("#object-pane-pos-y").val(this.scene.selected.position.y)
		$("#object-pane-pos-z").val(this.scene.selected.position.z)
		$("#object-pane-color").val("")
	}
}

QL.gui.Editor.prototype.objectUpdate = function(objId){
	if(!objId){
		return false;
	}
	var objRef = this.scene.getObjectById(objId);
	objRef.name = $("#object-pane-name").val();
	objRef.position.x = parseInt($("#object-pane-pos-x").val());
	objRef.position.y = parseInt($("#object-pane-pos-y").val());
	objRef.position.z = parseInt($("#object-pane-pos-z").val());
	this.refreshLeftPanel();
}
