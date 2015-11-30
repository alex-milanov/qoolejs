"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Toolbar = function(dom, context){
	QL.gui.Element.call(this, dom, context);
};

QL.gui.Toolbar.prototype = Object.create( QL.gui.Element );
QL.gui.Toolbar.prototype.constructor = QL.gui.Toolbar;

QL.gui.Toolbar.prototype.init = function(){
	
	QL.gui.Element.prototype.init.call(this);
	
	var context = this.context;
	context.indexes = [-1];

	$(this.dom).find(".indexes").change(function(){
		context.indexes = $(this).val().split(",");
	});
};

QL.gui.Toolbar.prototype.refresh = function(){
	
};