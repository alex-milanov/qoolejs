import { body } from 'iblokz-snabbdom-helpers';
import toolbar from './toolbar';
import panel from './panel';
import views from './views';

export default ({ state, actions }) => body('.gui', [
	toolbar({ state, actions }),
	panel({ state, actions }),
	views({ state, actions })
]);
