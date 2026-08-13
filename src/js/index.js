import { createState, dispatch } from 'iblokz-state';
import { patchStream } from 'iblokz-snabbdom-helpers';
import { toVNode } from 'snabbdom';
import { map, distinctUntilChanged } from 'rxjs';

import actionsTree from './actions';
import ui from './ui';
import QL from './ql';
import {
	STORAGE_KEY,
	serializeTheme,
	applyDocumentTheme
} from './util/theme';

let { actions, state$ } = createState(actionsTree);
window.actions = actions;

applyDocumentTheme(state$.getValue().themeMode);

state$
	.pipe(
		map(s => s.themeMode),
		distinctUntilChanged()
	)
	.subscribe(mode => {
		applyDocumentTheme(mode);
		try {
			localStorage.setItem(STORAGE_KEY, serializeTheme(mode));
		} catch (_) {
			/* ignore */
		}
	});

// state -> ui
let vnode$ = state$.pipe(map(state => ui({ state, actions })));
let patchSubscription = patchStream(vnode$, toVNode(document.body));

// legacy editor after layout (double rAF = after paint)
const bootEditor = () => {
	const el = document.querySelector('#view-tr');
	if (!el || el.clientWidth === 0) {
		requestAnimationFrame(bootEditor);
		return;
	}
	if (window.editor) return;
	try {
		const state = state$.getValue();
		const editor = new QL.gui.Editor(state.views, state.entities);
		editor.init();
		window.editor = editor;
	} catch (err) {
		console.error('QL editor init failed', err);
	}
};
requestAnimationFrame(() => requestAnimationFrame(bootEditor));

if (module.hot) {
	module.hot.dispose(function(data) {
		data.state = state$.getValue();
		patchSubscription.unsubscribe();
		state$.complete();
		window.editor = null;
		document.body.innerHTML = document.body.innerHTML;
	});
	module.hot.accept(function() {
		dispatch(() => module.hot.data.state);
	});
}
