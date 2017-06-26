"use strict";

var Element = function(dom){

	this.dom = null;

	console.log(dom)

	var htmlTags = [
		"div","span","p","ul","li","a","img",
		"table","tbody","tr","td","thead","th","tfoot",
		"form","input","select","button","textarea","label",
		"header","section","canvas"
	];

	switch( typeof dom){
		case "object":
			if( !!dom && dom instanceof HTMLElement){
				this.dom = dom;
			}
			break;
		case "string":
			if(htmlTags.indexOf(dom) > -1){
				this.dom = document.createElement(dom);
			} else {
				var selected = document.querySelector(dom);
				if(!!selected)
					this.dom = selected;
			}
			break;
	}

};

Element.prototype.on = function(eventName, listener){
	this.dom.addEventListener(eventName, listener);
	return this;
}

Element.prototype.append = function(target){
	this.dom.appendChild(target);
	return this;
}

Element.prototype.appendTo = function(target){
	if (target instanceof Element){
		target.append(this.dom);
	} else if (target instanceof HTMLElement){
		target.appendChild(this.dom);
	} else {
		return false;
	}

	return this;
}

Element.prototype.find = function(selector){
	return this.dom.querySelectorAll(selector);
}

export default Element;
