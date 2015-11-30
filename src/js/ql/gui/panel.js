"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Panel = function(dom, context){
	QL.gui.Element.call(this, dom, context);
};

QL.gui.Panel.prototype = Object.create( QL.gui.Element.prototype );
QL.gui.Panel.prototype.constructor = QL.gui.Panel;

QL.gui.Panel.prototype.init = function(){
	QL.gui.Element.prototype.init.call(this);
	$(this.dom).find(".pane-body").perfectScrollbar();
};

QL.gui.Panel.prototype.refresh = function(){
	
	var context = this.context;

	// clean up the entities list
	var $meshEntities = $(this.dom).find(".entities#mesh-entities");
	$meshEntities.html("");

	context.scene.children.forEach(function(_entity){
		var _el = $("<span></span>");
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
				context.select(parseInt($(this).attr("data-obj-id")));
			});
		}

		switch(_entity.type){
			case "Mesh":
				$meshEntities.append($("<li></li>").append(_el));
				break;
		}
	});
	context.refreshObjectPane();

	$(this.dom).find(".pane-body").perfectScrollbar('update');
};