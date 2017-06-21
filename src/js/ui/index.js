'use strict';

// dom
const {form, input, section, button, span, canvas, ul, li} = require('iblokz-snabbdom-helpers');
// components
const toolbar = require('./toolbar');

module.exports = toolbar;

/*
module.exports = ({state, actions}) => section('.gui', [
  toolbar({state, actions})
]);
*/
