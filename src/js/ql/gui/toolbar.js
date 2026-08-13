import { fromEvent } from 'rxjs';
import Element from './element';

export default class Toolbar extends Element {
	init() {
		super.init();

		let context = this.context;
		let dom = this.dom;

		context.indexes = [-1];

		[].slice.call(dom.querySelectorAll('.indexes')).map(el =>
			fromEvent(el, 'change').subscribe(() => {
				context.indexes = el.value.split(",");
			})
		);
	}

	refresh() {

	}
}
