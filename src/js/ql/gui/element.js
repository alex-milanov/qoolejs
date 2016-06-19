'use strict';

import {Observable as $} from 'rx-lite';

var Element = function(dom, context){

	this.dom = (dom instanceof HTMLElement)
		? dom
		: (typeof dom === 'string')
			? document.querySelector(dom)
			: false;

	this.context = (typeof context === 'undefined') ? this : context ;

};

Element.prototype.init = function(){

	let context = this.context;
	let dom = this.dom;

	[].slice.call(dom.querySelectorAll('[class*=\'-toggle\']'))
		.map(el =>
			$.fromEvent(el, 'click').map(() => {
				el.classList.toggle('toggled');
				let toggleRefEl = document.querySelector(el.getAttribute('data-toggle-ref'));
				let toggleClass = el.getAttribute('data-toggle-class');
				let toggleParam = el.getAttribute('data-toggle-param');
				let toggleSelf = el.getAttribute('data-toggle-self');
				console.log(toggleRefEl, toggleClass, toggleParam, toggleSelf);
				toggleRefEl.classList.toggle(toggleClass);
				if(toggleSelf) {
					console.log(toggleSelf);
					toggleSelf.split(' ').map(
						cls => el.classList.toggle(cls)
					);
				}
				if(toggleParam !== ""){
					if(!context.params)
						context.params = {};
					context.params[toggleParam] = !context.params[toggleParam];
				}
			}).subscribe()
		);

	[].slice.call(dom.querySelectorAll('[class*=\'-trigger\']'))
		.map(el =>
			$.fromEvent(el, 'click').map(() => {
				let triggerMethod = el.getAttribute('data-trigger-method');
				let triggerId = el.getAttribute('data-trigger-id');
				if(typeof context[triggerMethod] !== "undefined"){
					if(triggerId){
						context[triggerMethod](triggerId);
					} else {
						context[triggerMethod]();
					}
				}
			}).subscribe()
		);

	[].slice.call(dom.querySelectorAll('[class*=\'-option\']')).map(el =>
		$.fromEvent(el, 'click').map(() => {
			let optionParam = el.getAttribute('data-option-param');
			let optionValue = el.getAttribute('data-option-value');
			[].slice.call(dom.querySelectorAll(`[data-option-param='${optionParam}']`))
				.map(el => el.classList.remove('selected'));
			el.classList.add('selected');
			if(!context.params)
				context.params = {};
			context.params[optionParam] = optionValue;
		}).subscribe()
	);

};

export default Element;
