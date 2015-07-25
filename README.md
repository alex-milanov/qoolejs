# QooleJS

demo: http://qoolejs.wp.alexmilanov.com

I am working on resurrecting a quake2 level editor from 99.
I find the object interaction better than most editors out there 
like blender and 3dsmax and with the 2015 tech we can make it even better.

## setup

### dependencies
```sh
npm install -g gulp node-serve
# we will need sass
gem install sass
```

### install & build
```sh
npm install
bower install
gulp build
```

### running options
the easiest way
```sh
# launches gulp build and gulp serve
gulp
```
just serving
```sh
# launches static server, watch and livereload
gulp serve
```
less resource heavy opiton
```sh
# open in 2 tabs
serve --path dist
gulp watch
```
