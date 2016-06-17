'use strict';

import jQuery from 'jquery';
import Element from './element';

var Panel = function(dom, context){
	Element.call(this, dom, context);
};

Panel.prototype = Object.create( Element.prototype );
Panel.prototype.constructor = Panel;

Panel.prototype.init = function(){
	Element.prototype.init.call(this);
	jQuery(this.dom).find(".pane-body").perfectScrollbar();
};

Panel.prototype.refresh = function(){

	var context = this.context;

	// clean up the entities list
	var $meshEntities = jQuery(this.dom).find(".entities#mesh-entities");
	$meshEntities.html("");

	context.scene.children.forEach(function(_entity){
		var _el = jQuery("<span></span>");
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
				context.select(parseInt(jQuery(this).attr("data-obj-id")));
			});
		}

		switch(_entity.type){
			case "Mesh":
				$meshEntities.append(jQuery("<li></li>").append(_el));
				break;
		}
	});
	context.refreshObjectPane();

	jQuery(this.dom).find(".pane-body").perfectScrollbar('update');
};

export default Panel;
