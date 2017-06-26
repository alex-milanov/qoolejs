'use strict';

// dom
const {
  section, div, span, a, p, ul, li, i,
  form, input, button, canvas, img, h
} = require('iblokz-snabbdom-helpers');
const {obj, str, fn} = require('iblokz-data');
// components

const layers = ['grid', 'scene', 'selection', 'indicators'];
const views = {
    tl: {
        dom: '#view-tl',
        perspective: 'top'
    },
    tr: {
        dom: '#view-tr',
        perspective: '3d'
    },
    bl: {
        dom: '#view-bl',
        perspective: 'front'
    },
    br: {
        dom: '#view-br',
        perspective: 'side'
    }
};

module.exports = ({state, actions}) => section('.views', {
}, Object.keys(views).map(view =>
    section(`${views[view].dom}.view`, [].concat(
        a('.fullscreen-toggle.fa.fa-expand', {
            attrs: {
                'data-toggle-ref': views[view].dom,
                'data-toggle-class': 'fullscreen',
                'data-toggle-self': 'fa-compress fa-expand',
                'title': 'Fullscreen [F]'
            }
        }),
        views[view].perspective === '3d'
            ? h('canvas.layer-3d')
            : layers.map(layer => h(`canvas.${layer}-layer`))
    ))
));