'use strict';

import jQuery from 'jquery';

var Element = function(dom, context){

	this.dom = dom;
	this.context = (typeof context === 'undefined') ? this : context ;

};

Element.prototype.init = function(){

	var context = this.context;

	jQuery(this.dom).on("click","[class*='-toggle']",function(){
		jQuery(this).toggleClass("toggled");
		var jQuerytoggleRef = jQuery(jQuery(this).data("toggle-ref"));
		var _toggleClass = jQuery(this).data("toggle-class");
		var _toggleParam = jQuery(this).data("toggle-param");
		var _toggleSelf = jQuery(this).data("toggle-self") || "";
		jQuerytoggleRef.toggleClass(_toggleClass);
		jQuery(this).toggleClass(_toggleSelf);
		if(_toggleParam !== ""){
			if(!context.params)
				context.params = {};
			context.params[_toggleParam] = !context.params[_toggleParam];
		}
	});

	jQuery(this.dom).on("click","[class*='-trigger']",function(){
		var _triggerMethod = jQuery(this).data("trigger-method");
		if(typeof context[_triggerMethod] !== "undefined"){
			if(jQuery(this).data("trigger-id")){
				context[_triggerMethod](jQuery(this).data("trigger-id"));
			} else {
				context[_triggerMethod]();
			}
		}
	});

	jQuery(this.dom).on("click","[class*='-option']",function(_ev){
		jQuery("a[class*='-option']").removeClass("selected");
		jQuery(this).addClass("selected");

		var _optionParam = jQuery(this).data("option-param");
		var _optionValue = jQuery(this).data("option-value");

		if(!context.params)
			context.params = {};
		context.params[_optionParam] = _optionValue;
	});

};

export default Element;
