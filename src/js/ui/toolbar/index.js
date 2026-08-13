import {
	section, div, a, i, img
} from 'iblokz-snabbdom-helpers';
import { str, fn } from 'iblokz-data';

const leftBarTools = [
	{
		type: 'option',
		param: 'obj-mode',
		value: 'move',
		title: 'Move Mode',
		shortkey: 'M',
		selected: true
	},
	{
		type: 'option',
		param: 'obj-mode',
		value: 'rotate',
		title: 'Rotate Mode',
		shortkey: 'R'
	},
	{
		type: 'option',
		param: 'obj-mode',
		value: 'scale',
		title: 'Scale Mode',
		shortkey: 'S'
	},
	{
		type: 'splitter'
	},
	{
		type: 'trigger',
		method: 'newMesh',
		title: 'New Mesh',
		shortkey: 'N',
		icon: '.fa.fa-plus'
	},
	{
		type: 'trigger',
		method: 'newMesh',
		title: 'New Mesh',
		shortkey: 'N',
		icon: '.fa.fa-clone'
	},
	{
		type: 'trigger',
		method: 'clearScene',
		title: 'Clear Scene',
		shortkey: 'L',
		icon: '.fa.fa-trash'
	}
];

export default ({ state, actions }) => section('.toolbar', [
	div('.logo', 'QooleJS'),
	a('.panel-toggle.fa.fa-bars.toggled', {
		attrs: {
			'data-toggle-ref': '.panel.left',
			'data-toggle-class': 'opened'
		}
	}),
	div('.left-bar', leftBarTools.map(tool => fn.switch(tool.type, {
		default: () => '',
		splitter: () => div('.splitter'),
		option: () => a(`.${tool.param}-option`, {
			class: {
				selected: tool.selected
			},
			attrs: {
				'data-option-param': tool.param,
				'data-option-value': tool.value,
				title: `${tool.title} [${tool.shortkey}]`
			}
		}, img(`[src="img/icons/${tool.value}.png"]`)),
		trigger: () => a(`.${str.fromCamelCase(tool.method, '-')}-trigger`, {
			attrs: {
				'data-trigger-method': tool.method,
				title: `${tool.title} [${tool.shortkey}]`
			}
		}, i(tool.icon))
	})()))
]);
