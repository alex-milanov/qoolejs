"use strict";

var History = function(){

	this.events = [];
	this.index = -1;

};

History.prototype = {
	add: function(undo, redo, title){
		this.index ++;

		if(this.events.length > this.index){
			this.events.splice(this.index,this.events.length-this.index);
		}

		var time = new Date().getTime();

		var lastEvent = (this.index > 0) ? this.events[this.index-1] : false;

		// if the event has the same title as last and less than 3s have passed join them
		if(lastEvent && title == lastEvent.title && (time - lastEvent.time) < 3000){
			this.index --;
			this.events[this.index].time = time;
			this.events[this.index].redo = redo;
		} else {
			this.events.push({
				undo: undo,
				redo: redo,
				title: title,
				time: time
			})
		}
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

};

export default History;
