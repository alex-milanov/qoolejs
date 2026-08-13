export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Pointer drag for split gutters. Live updates via onMove; commit in onEnd.
 * Avoids full UI re-renders mid-drag.
 */
export const startSplitDrag = ({
	event,
	axis = 'x',
	onMove,
	onEnd
}) => {
	if (!event || event.button !== 0) return;
	event.preventDefault();
	event.stopPropagation();

	const start = axis === 'x' ? event.clientX : event.clientY;
	const target = event.currentTarget;
	if (target && target.setPointerCapture) {
		try {
			target.setPointerCapture(event.pointerId);
		} catch (_) {
			/* ignore */
		}
	}

	document.body.classList.add(axis === 'x' ? 'is-resizing-x' : 'is-resizing-y');

	const onPointerMove = ev => {
		const current = axis === 'x' ? ev.clientX : ev.clientY;
		onMove(current - start, ev);
	};

	const onPointerUp = ev => {
		document.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('pointerup', onPointerUp);
		document.removeEventListener('pointercancel', onPointerUp);
		document.body.classList.remove('is-resizing-x', 'is-resizing-y');
		const current = axis === 'x' ? ev.clientX : ev.clientY;
		if (typeof onEnd === 'function') onEnd(current - start, ev);
	};

	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('pointerup', onPointerUp);
	document.addEventListener('pointercancel', onPointerUp);
};
