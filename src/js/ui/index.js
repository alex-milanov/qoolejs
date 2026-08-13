import { body, section } from 'iblokz-snabbdom-helpers';
import { clamp } from '../util/split-drag';
import toolbar from './toolbar';
import panel from './panel';
import views from './views';
import splitGutter from './comp/split-gutter';

export default ({ state, actions }) => {
	const layout = state.layout || {};
	const sideBarOpen = !!state.sideBar;
	const sideBarWidth = sideBarOpen ? (layout.sideBar || 250) : 0;

	return body('.gui', [
		toolbar({ state, actions }),
		section('.workspace', [
			panel({ state, actions, width: sideBarWidth }),
			splitGutter({
				axis: 'x',
				hidden: !sideBarOpen,
				onStart: () => {
					const el = document.querySelector('.panel.left');
					return {
						el,
						start: el ? el.getBoundingClientRect().width : (layout.sideBar || 250)
					};
				},
				onMove: (delta, ev, ctx) => {
					if (!ctx || !ctx.el) return;
					ctx.el.style.width = `${clamp(ctx.start + delta, 140, 480)}px`;
				},
				onEnd: (delta, ev, ctx) => {
					const next = clamp((ctx && ctx.start || 250) + delta, 140, 480);
					if (ctx && ctx.el) ctx.el.style.width = `${next}px`;
					actions.setLayout({ sideBar: next });
				}
			}),
			views({ state, actions })
		])
	]);
};
