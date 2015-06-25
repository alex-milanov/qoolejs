"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.Quad = function ( a, b, c, d ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

};

QL.ext.Quad.prototype = {

	constructor: QL.ext.Quad,

	clone: function () {

		var quad = new QL.ext.Quad( this.a, this.b, this.c, this.d );

		return quad;

	}

};