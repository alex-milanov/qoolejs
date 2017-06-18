'use strict';

import {Observable as $} from 'rx';
import Element from './element';

var Toolbar = function(dom, context){
	Element.call(this, dom, context);
};

Toolbar.prototype = Object.create( Element );
Toolbar.prototype.constructor = Toolbar;

Toolbar.prototype.init = function(){

	Element.prototype.init.call(this);

	let context = this.context;
	let dom = this.dom;

	context.indexes = [-1];

	[].slice.call(dom.querySelectorAll('.indexes')).map(el =>
		$.fromEvent(el, 'change').map(() => {
			context.indexes = el.value.split(",");
		}).subscribe()
	);
};

Toolbar.prototype.refresh = function(){

};

export default Toolbar;
