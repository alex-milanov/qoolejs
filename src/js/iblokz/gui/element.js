const htmlTags = [
	"div", "span", "p", "ul", "li", "a", "img",
	"table", "tbody", "tr", "td", "thead", "th", "tfoot",
	"form", "input", "select", "button", "textarea", "label",
	"header", "section", "canvas"
];

export default class Element {
	constructor(dom) {
		switch (typeof dom) {
			case "object":
				if (Boolean(dom) && dom instanceof HTMLElement) {
					this.dom = dom;
				}
				break;
			case "string":
				if (htmlTags.indexOf(dom) > -1) {
					this.dom = document.createElement(dom);
				} else {
					var selected = document.querySelector(dom);
					if (selected)
						this.dom = selected;
				}
				break;
			default:
				this.dom = null;
				break;
		}
	}

	on(eventName, listener) {
		this.dom.addEventListener(eventName, listener);
		return this;
	}

	append(target) {
		this.dom.appendChild(target);
		return this;
	}

	appendTo(target) {
		if (target instanceof Element) {
			target.append(this.dom);
		} else if (target instanceof HTMLElement) {
			target.appendChild(this.dom);
		} else {
			return false;
		}

		return this;
	}

	find(selector) {
		return this.dom.querySelectorAll(selector);
	}
}
