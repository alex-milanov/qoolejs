import { div } from 'iblokz-snabbdom-helpers';
import { startSplitDrag } from '../../util/split-drag';

export default ({
	axis = 'x',
	hidden = false,
	key,
	onStart,
	onMove,
	onEnd
}) => div(`.split-gutter.split-gutter--${axis}`, {
	key,
	class: {
		hidden: !!hidden
	},
	attrs: {
		role: 'separator',
		'aria-orientation': axis === 'x' ? 'vertical' : 'horizontal',
		title: 'Drag to resize'
	},
	on: {
		pointerdown: ev => {
			if (hidden) return;
			const ctx = typeof onStart === 'function' ? onStart(ev) : {};
			startSplitDrag({
				event: ev,
				axis,
				onMove: (delta, moveEv) => {
					if (typeof onMove === 'function') onMove(delta, moveEv, ctx);
				},
				onEnd: (delta, endEv) => {
					if (typeof onEnd === 'function') onEnd(delta, endEv, ctx);
				}
			});
		}
	}
});
