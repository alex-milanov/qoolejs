import {
	section, a, h
} from 'iblokz-snabbdom-helpers';
import { clamp } from '../../util/split-drag';
import splitGutter from '../comp/split-gutter';

const layers = ['grid', 'scene', 'selection', 'indicators'];

const viewConf = {
	tl: { dom: '#view-tl', perspective: 'top', col: 'left' },
	tr: { dom: '#view-tr', perspective: '3d', col: 'right' },
	bl: { dom: '#view-bl', perspective: 'front', col: 'left' },
	br: { dom: '#view-br', perspective: 'side', col: 'right' }
};

const renderView = key => {
	const conf = viewConf[key];
	return section(`${conf.dom}.view.view--${conf.col}`, [].concat(
		a('.fullscreen-toggle.fa.fa-expand', {
			attrs: {
				'data-toggle-ref': conf.dom,
				'data-toggle-class': 'fullscreen',
				'data-toggle-self': 'fa-compress fa-expand',
				title: 'Fullscreen [F]'
			}
		}),
		conf.perspective === '3d'
			? h('canvas.layer-3d')
			: layers.map(layer => h(`canvas.${layer}-layer`))
	));
};

const setViewsVar = (name, value) => {
	const el = document.querySelector('.views');
	if (el) el.style.setProperty(name, String(value));
};

const startViewsX = layout => () => {
	const el = document.querySelector('.views');
	const start = layout.viewsX || 0.5;
	return { el, start, width: el ? el.getBoundingClientRect().width : 0 };
};

const moveViewsX = (delta, ev, ctx) => {
	if (!ctx || !ctx.width) return;
	const next = clamp(ctx.start + delta / ctx.width, 0.2, 0.8);
	setViewsVar('--views-x', next);
	ctx.next = next;
};

const endViewsX = (actions) => (delta, ev, ctx) => {
	const next = ctx && ctx.next != null
		? ctx.next
		: clamp((ctx && ctx.start || 0.5) + (ctx && ctx.width ? delta / ctx.width : 0), 0.2, 0.8);
	setViewsVar('--views-x', next);
	actions.setLayout({ viewsX: next });
};

const startViewsY = layout => () => {
	const el = document.querySelector('.views');
	const start = layout.viewsY || 0.5;
	return { el, start, height: el ? el.getBoundingClientRect().height : 0 };
};

const moveViewsY = (delta, ev, ctx) => {
	if (!ctx || !ctx.height) return;
	const next = clamp(ctx.start + delta / ctx.height, 0.2, 0.8);
	setViewsVar('--views-y', next);
	ctx.next = next;
};

const endViewsY = (actions) => (delta, ev, ctx) => {
	const next = ctx && ctx.next != null
		? ctx.next
		: clamp((ctx && ctx.start || 0.5) + (ctx && ctx.height ? delta / ctx.height : 0), 0.2, 0.8);
	setViewsVar('--views-y', next);
	actions.setLayout({ viewsY: next });
};

export default ({ state, actions }) => {
	const layout = state.layout || {};
	const viewsX = layout.viewsX || 0.5;
	const viewsY = layout.viewsY || 0.5;

	return section('.views', {
		style: {
			'--views-x': String(viewsX),
			'--views-y': String(viewsY)
		}
	}, [
		section('.views-row.views-row--top', { key: 'views-top' }, [
			renderView('tl'),
			splitGutter({
				key: 'views-gx-top',
				axis: 'x',
				onStart: startViewsX(layout),
				onMove: moveViewsX,
				onEnd: endViewsX(actions)
			}),
			renderView('tr')
		]),
		splitGutter({
			key: 'views-gy',
			axis: 'y',
			onStart: startViewsY(layout),
			onMove: moveViewsY,
			onEnd: endViewsY(actions)
		}),
		section('.views-row.views-row--bottom', { key: 'views-bottom' }, [
			renderView('bl'),
			splitGutter({
				key: 'views-gx-bottom',
				axis: 'x',
				onStart: startViewsX(layout),
				onMove: moveViewsX,
				onEnd: endViewsX(actions)
			}),
			renderView('br')
		])
	]);
};
