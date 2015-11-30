

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }


QL.gui.Element = function(dom, context){

	this.dom = dom;
	this.context = (typeof context === 'undefined') ? this : context ;

};

QL.gui.Element.prototype.init = function(){

	var context = this.context;

	$(this.dom).on("click","[class*='-toggle']",function(){
		$(this).toggleClass("toggled");
		var $toggleRef = $($(this).data("toggle-ref"));
		var _toggleClass = $(this).data("toggle-class");
		var _toggleParam = $(this).data("toggle-param");
		var _toggleSelf = $(this).data("toggle-self") || "";
		$toggleRef.toggleClass(_toggleClass);
		$(this).toggleClass(_toggleSelf);
		if(_toggleParam !== ""){
			if(!context.params)
				context.params = {};
			context.params[_toggleParam] = !context.params[_toggleParam];
		}
	});

	$(this.dom).on("click","[class*='-trigger']",function(){
		var _triggerMethod = $(this).data("trigger-method");
		if(typeof context[_triggerMethod] !== "undefined"){
			if($(this).data("trigger-id")){
				context[_triggerMethod]($(this).data("trigger-id"));
			} else {
				context[_triggerMethod]();
			}
		}
	});

	$(this.dom).on("click","[class*='-option']",function(_ev){
		$("a[class*='-option']").removeClass("selected");
		$(this).addClass("selected");

		var _optionParam = $(this).data("option-param");
		var _optionValue = $(this).data("option-value");

		if(!context.params)
			context.params = {};
		context.params[_optionParam] = _optionValue;
	});


};