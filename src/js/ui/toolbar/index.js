'use strict';

// dom
const {
  section, div, span, a, p, ul, li, i,
  form, input, button, canvas, img
} = require('iblokz-snabbdom-helpers');
const {obj, str, fn} = require('iblokz-data');
// components
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
  },
]

module.exports = ({state, actions}) => section('.toolbar', [
  div('.logo', 'QooleJS'),
  a('.panel-toggle.fa.fa-bars.toggled', {attrs: {
    'data-toggle-ref': '.panel.left',
    'data-toggle-class': 'opened'
  }}),
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
        'title': `${tool.title} [${tool.shortkey}]`
      }
    }, img(`[src="img/icons/${tool.value}.png"]`)),
    trigger: () => a(`.${str.fromCamelCase(tool.method, '-')}-trigger`, {
      attrs: {
        'data-trigger-method': tool.method,
        'title': `${tool.title} [${tool.shortkey}]`
      }
    }, i(tool.icon))
  })()))
  /*
  .right-bar
    a.undo-trigger(
      data-trigger-method='undo',
      title='Undo [Ctrl+Z]'
    ): i.fa.fa-undo
    a.redo-trigger(
      data-trigger-method='redo',
      title='Redo [Ctrl+Y]'
    ): i.fa.fa-repeat
    .splitter
    a.debug-toggle(
      data-toggle-ref='.debug-info',
      data-toggle-class='visible',
      data-toggle-param='debug',
      title='Debug [D]'
    ): i.fa.fa-bug
    span.debug-info
      input.indexes(type='number',placeholder='Indexes',value='-1')
    //- a.fullscreen-toggle(
    //- 	data-toggle-ref='.views',
    //- 	data-toggle-class='fullscreen'
    //- ) [F]ull Screen
    .debug-keys.fa.fa-keyboard-o
  */
]);
