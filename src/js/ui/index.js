'use strict';

// dom
const {form, input, section, button, span, canvas, ul, li} = require('iblokz-snabbdom-helpers');
// components
const toolbar = require('./toolbar');
const panel = require('./panel');
const views = require('./views');

module.exports = ({state, actions}) => section('.gui', [
  toolbar({state, actions}),
  panel({state, actions}),
  views({state, actions})
]);
