'use strict';

var Quad = function ( a, b, c, d ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

};

Quad.prototype = {
	constructor: Quad,
	clone: function () {

		var quad = new Quad( this.a, this.b, this.c, this.d );

		return quad;

	}
};

export default Quad;
