'use strict';

import {Observable as $} from 'rx-lite';
import Element from './element';

var Panel = function(dom, context){
	Element.call(this, dom, context);
};

Panel.prototype = Object.create( Element.prototype );
Panel.prototype.constructor = Panel;

Panel.prototype.init = function(){
	Element.prototype.init.call(this);
	//jQuery(this.dom).find(".pane-body").perfectScrollbar();
};

Panel.prototype.refresh = function(){

	let context = this.context;
	let dom = this.dom;

	let meshEntities = dom.querySelector('.entities#mesh-entities');

	// clean up the entities list
	while (meshEntities.firstChild) meshEntities.removeChild(meshEntities.firstChild);

	context.scene.children.forEach(function(entity){
		var el =  document.createElement('span');
		let name = '';
		if (entity.name) {
			name = entity.name
		} else {
			name = entity.type
			if (entity.geometry && entity.geometry.type) {
				name += `[ ${entity.geometry.type} ]`
			}
		}

		el.textContent = name;
		el.setAttribute("data-obj-id", entity.id);

		if(entity.selected) el.classList.add("selected");

		if(entity.type === "Mesh"){
			$.fromEvent(el, 'click').map(() =>
				context.select(parseInt(el.getAttribute("data-obj-id")))
			).subscribe();
		}

		switch(entity.type){
			case "Mesh":
				let li = document.createElement('li');
				li.appendChild(el);
				meshEntities.appendChild(li);
				break;
		}
	});
	context.refreshObjectPane();

	//jQuery(this.dom).find(".pane-body").perfectScrollbar('update');
};

export default Panel;
