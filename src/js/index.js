'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;


// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// legacy code
const QL  = require('./ql').default;

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
window.actions = actions;
let ui = require('./ui');
let actions$;

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
const state$ = actions$
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.map(state => (console.log(state), state))
	.publish();

// hooks
state$.take(1).subscribe(state => {
  // legacy init
  const editor = new QL.gui.Editor(state.views, state.entities);
  editor.init();
})

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

state$.connect();
