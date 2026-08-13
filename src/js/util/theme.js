const STORAGE_KEY = 'qoolejs-theme';
const THEME_MODES = ['dark', 'light'];

export const themeClass = mode => `theme-${mode === 'light' ? 'light' : 'dark'}`;

const parseStoredTheme = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (THEME_MODES.includes(parsed.mode)) return parsed.mode;
		if (THEME_MODES.includes(raw)) return raw;
	} catch (_) {
		/* ignore */
	}
	return null;
};

/** Default dark — grounded in the current Qoole chrome. */
export const getInitialThemeMode = () => parseStoredTheme() || 'dark';

export const serializeTheme = mode => JSON.stringify({
	mode: mode === 'light' ? 'light' : 'dark'
});

export const applyDocumentTheme = mode => {
	const resolved = mode === 'light' ? 'light' : 'dark';
	const root = document.documentElement;
	root.dataset.theme = resolved;
	root.style.colorScheme = resolved;
	root.classList.remove('theme-light', 'theme-dark');
	root.classList.add(`theme-${resolved}`);
};

export { STORAGE_KEY, THEME_MODES };
