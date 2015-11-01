"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.etc === "undefined"){ QL.etc = {}; }

QL.etc.History = function(){

	this.events = [];
	this.index = -1;

}

QL.etc.History.prototype = {
	add: function(undo, redo, title){
		this.index ++;

		if(this.events.length > this.index){
			this.events.splice(this.index,this.events.length-this.index);
		}

		this.events.push({
			undo: undo,
			redo: redo,
			title: title
		})
	},

	undo: function () {

		if ( this.index < 0 ) return;

		this.events[ this.index -- ].undo();

	},

	redo: function () {

		if ( this.index === this.events.length-1 ) return;

		this.events[ ++ this.index ].redo();

	},

	clear: function () {

		this.events = [];
		this.index = -1;

	}

}