'use strict';

import jQuery from 'jquery';
import Element from './element';

var Toolbar = function(dom, context){
	Element.call(this, dom, context);
};

Toolbar.prototype = Object.create( Element );
Toolbar.prototype.constructor = Toolbar;

Toolbar.prototype.init = function(){

	Element.prototype.init.call(this);

	var context = this.context;
	context.indexes = [-1];

	jQuery(this.dom).find(".indexes").change(function(){
		context.indexes = jQuery(this).val().split(",");
	});
};

Toolbar.prototype.refresh = function(){

};

export default Toolbar;
