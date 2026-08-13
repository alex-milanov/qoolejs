import {
	section, span, a, ul, li, i, input, button, label
} from 'iblokz-snabbdom-helpers';
import { fn } from 'iblokz-data';

const objProps = [
	{
		name: 'name',
		title: 'Name',
		type: 'string'
	},
	{
		name: 'pos',
		title: 'Position',
		type: 'vector3'
	},
	{
		name: 'scale',
		title: 'Scale',
		type: 'vector3'
	},
	{
		name: 'rotation',
		title: 'Rotation',
		type: 'vector3'
	},
	{
		name: 'color',
		title: 'Color',
		type: 'color'
	}
];

export default ({ state, actions, width = 250 }) => section('.panel.left', {
	class: {
		opened: !!state.sideBar
	},
	style: {
		width: state.sideBar ? `${width}px` : '0px'
	}
}, [
	section('#object-pane.pane', [
		section('.pane-title', span('Object [E]dit')),
		section('.pane-body', section('.section', [
			ul(objProps.map(prop =>
				fn.switch(prop.type, {
					default: () => li(),
					string: () => li([
						label(prop.title),
						input(`#object-pane-${prop.name}[type="text"]`)
					]),
					vector3: () => li([
						label(prop.title),
						input(`#object-pane-${prop.name}-x[type="number"].p30`),
						input(`#object-pane-${prop.name}-y[type="number"].p30`),
						input(`#object-pane-${prop.name}-z[type="number"].p30`)
					]),
					color: () => li([
						label(prop.title),
						input(`#object-pane-${prop.name}[type="color"]`)
					])
				})()
			)),
			button('.btn.update-object-trigger', {
				attrs: {
					'data-trigger-method': 'updateObject',
					'data-trigger-id': false
				}
			}, 'Update')
		]))
	]),
	section('#scene-pane.pane.active', [
		section('.pane-title', [
			span('#scene-title', 'Untitled'),
			a('.load-scene-trigger', {
				attrs: {
					'data-trigger-method': 'loadScene',
					title: 'Load Scene'
				}
			}, i('.fa.fa-folder-open-o')),
			a('.save-scene-trigger', {
				attrs: {
					'data-trigger-method': 'saveScene',
					title: 'Save Scene'
				}
			}, i('.fa.fa-save')),
			a('.new-scene-trigger', {
				attrs: {
					'data-trigger-method': 'newScene',
					title: 'New Scene'
				}
			}, i('.fa.fa-file-o'))
		]),
		section('.pane-body', [
			section('.section', section('.section-title', 'Lights')),
			section('.section', section('.section-title', 'Cameras')),
			section('.section', [
				section('.section-title', 'Meshes'),
				ul('#mesh-entities.entities', state.scene.children.map(entity =>
					li(span([
						entity.name || '',
						a('.entity-edit-trigger', {
							attrs: {
								'data-trigger-method': 'edit',
								'data-trigger-id': entity.id
							}
						})
					]))
				))
			])
		])
	])
]);
