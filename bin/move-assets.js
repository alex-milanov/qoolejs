'use strict';

const fse = require('fs-extra');
const path = require('path');

const paths = {
  'dist/fonts': 'node_modules/font-awesome/fonts',
  'dist/img': 'src/img'
};

Object.keys(paths).forEach(
  p => fse.copySync(
    path.resolve(__dirname, '..', paths[p]),
    path.resolve(__dirname, '..', p)
  )
);
