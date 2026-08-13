import { fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const onAll = (parent, selector, event) => merge(...(
	Array.from(parent.querySelectorAll(selector))
		.map(el => fromEvent(el, event).pipe(map(ev => [ev, el])))
));

export default class Element {
	constructor(dom, context) {
		this.dom = (dom instanceof HTMLElement)
			? dom
			: (typeof dom === 'string')
				? document.querySelector(dom)
				: false;

		this.context = (typeof context === 'undefined') ? this : context;
	}

	init() {
		let context = this.context;
		let dom = this.dom;

		console.log(dom, context);

		// impl toggleable interraction with data attributes
		onAll(this.dom, '[class*=\'-toggle\']', 'click')
			.subscribe(([ev, el]) => {
				el.classList.toggle('toggled');
				let toggleRefEl = document.querySelector(el.getAttribute('data-toggle-ref'));
				let toggleClass = el.getAttribute('data-toggle-class');
				let toggleParam = el.getAttribute('data-toggle-param');
				let toggleSelf = el.getAttribute('data-toggle-self');
				console.log(toggleRefEl, toggleClass, toggleParam, toggleSelf);
				toggleRefEl.classList.toggle(toggleClass);
				if (toggleSelf) {
					console.log(toggleSelf);
					toggleSelf.split(' ').map(
						cls => el.classList.toggle(cls)
					);
				}
				if (toggleParam !== "") {
					if (!context.params)
						context.params = {};
					context.params[toggleParam] = !context.params[toggleParam];
				}
			});

		onAll(this.dom, '[class*=\'-trigger\']', 'click')
			.subscribe(([ev, el]) => {
				let triggerMethod = el.getAttribute('data-trigger-method');
				let triggerId = el.getAttribute('data-trigger-id');
				if (typeof context[triggerMethod] !== "undefined") {
					if (triggerId) {
						context[triggerMethod](triggerId);
					} else {
						context[triggerMethod]();
					}
				}
			});

		onAll(this.dom, '[class*=\'-option\']', 'click')
			.subscribe(([ev, el]) => {
				let optionParam = el.getAttribute('data-option-param');
				let optionValue = el.getAttribute('data-option-value');
				[].slice.call(dom.querySelectorAll(`[data-option-param='${optionParam}']`))
					.map(el => el.classList.remove('selected'));
				el.classList.add('selected');
				if (!context.params)
					context.params = {};
				context.params[optionParam] = optionValue;
			});
	}
}
