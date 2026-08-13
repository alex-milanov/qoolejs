const LAYOUT_KEY = 'qoolejs.layout';

const defaults = {
	sideBar: 250,
	viewsX: 0.5,
	viewsY: 0.5
};

const clampRatio = (n, fallback) => {
	const v = Number(n);
	if (!Number.isFinite(v)) return fallback;
	return Math.min(0.8, Math.max(0.2, v));
};

export const clampLayout = (layout = {}) => ({
	sideBar: Math.min(480, Math.max(140, Number(layout.sideBar) || defaults.sideBar)),
	viewsX: clampRatio(layout.viewsX, defaults.viewsX),
	viewsY: clampRatio(layout.viewsY, defaults.viewsY)
});

export const loadLayout = () => {
	try {
		const raw = localStorage.getItem(LAYOUT_KEY);
		if (!raw) return { ...defaults };
		return clampLayout(JSON.parse(raw));
	} catch (_) {
		return { ...defaults };
	}
};

export const saveLayout = layout => {
	const next = clampLayout(layout);
	try {
		localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
	} catch (_) {
		/* ignore */
	}
	return next;
};

export { LAYOUT_KEY, defaults };
