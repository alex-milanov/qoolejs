'use strict';

import THREE from 'three';

import ext from '../ext';
import Element from './element';

var View3D = function(conf, scene, editor){
	Element.call(this, conf.dom);

	let dom = this.dom;

	this.canvas = dom.querySelector(".layer-3d");
	this.perspective = conf.perspective;

	this.editor = editor;

	this.canvas.width = dom.clientWidth;
	this.canvas.height = dom.clientHeight;
	this.center = [
		this.canvas.width/2,
		this.canvas.height/2
	];

	if(typeof scene === "undefined"){
		this.scene = new THREE.Scene();
	} else {
		this.scene = scene;
	}

	this.renderer = new THREE.WebGLRenderer({
		canvas: this.canvas
	});

	this.renderer.setSize(this.canvas.width, this.canvas.height );

	this.scene.fog = new THREE.Fog( 0x33373f, 500, 10000 );

	this.camera = new THREE.PerspectiveCamera( 75, this.canvas.width / this.canvas.height, 1, 10000 );
	this.camera.position.z = 300;
	this.camera.position.y = 50;


	this.scene.add(this.camera);


	// lights
	var light;

	//this.scene.add( new THREE.AmbientLight( 0x555555 ) );

	light = new THREE.DirectionalLight( 0xdfebff, 1.8 );
	light.position.set( 40, 50, 40 );
	light.position.multiplyScalar( 1.3 );

	light.castShadow = true;
	//light.shadowCameraVisible = true;

	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;

	var d = 300;

	light.shadowCameraLeft = -d;
	light.shadowCameraRight = d;
	light.shadowCameraTop = d;
	light.shadowCameraBottom = -d;

	light.shadowCameraFar = 1000;
	light.shadowDarkness = 0.5;

	this.scene.add( light );

	var grid = new THREE.GridHelper( 500, 25 );
	this.scene.add(grid);

	//this.scene.add( light );

	this.renderer.setClearColor( this.scene.fog.color );

	this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;

	//this.renderer.shadowMap.cullFace = THREE.CullFaceBack;
	//this.renderer.shadowMap.enabled = true;
};

View3D.prototype = Object.create( Element.prototype );
View3D.prototype.constructor = View3D;

View3D.prototype.addBlock = function(entity){

	var width = entity.finish[0]-entity.start[0];
	var height = entity.finish[1]-entity.start[1];
	var depth = entity.finish[2]-entity.start[2];

	var pos = {
		x: (entity.start[0]+width/2),
		y: (entity.start[1]+height/2),
		z: (entity.start[2]+depth/2)
	};

	var geometry = new ext.BoxGeometry( width, height, depth );
	var color = entity.color || 0x777777;
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
	var mesh = new ext.Mesh( geometry, material );
	mesh.position.set( pos.x, pos.y, pos.z );
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	if(entity.name){
		mesh.name = entity.name;
	}

	this.scene.add( mesh );
};

View3D.prototype.addEntities = function(entities){

	var that = this;
	entities.forEach(function(entity){
		switch(entity.type){
			case "cube":
				that.addCube(entity);
				break;
			case "block":
				that.addBlock(entity);
				break;
		}
	});
};

View3D.prototype.init = function(){
	Element.prototype.init.call(this);

	var scope = this;

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	function onDocumentTouchStart( event ) {

		event.preventDefault();

		event.offsetX = event.touches[0].offsetX;
		event.offsetY = event.touches[0].offsetY;
		onDocumentMouseDown( event );

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		mouse.x = event.offsetX/scope.canvas.clientWidth*2 - 1; //( event.clientX / scope.canvas.clientWidth ) * 2 - 1;
		mouse.y = -event.offsetY/scope.canvas.clientHeight*2 + 1; //( event.clientY / scope.canvas.clientHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, scope.camera );

		var objects = [];
		scope.scene.children.forEach(function(child){
			if(child.type === "Mesh"){
				objects.push(child);
			}
		})

		var intersects = raycaster.intersectObjects( objects );


		if ( intersects.length > 0 ) {

			if(!scope.scene.selected){
				scope.editor.select(intersects[ 0 ].object.id);
			} else {
				var selectedIndex = -1;
				intersects.forEach(function(intersect, index){
					if(intersect.object.id === scope.scene.selected.id){
						selectedIndex = index;
					}
				})

				if(selectedIndex + 1 >= intersects.length){
					scope.editor.select(intersects[ 0 ].object.id);
				} else {
					scope.editor.select(intersects[ selectedIndex + 1 ].object.id)
				}
			}


			/*var particle = new THREE.Sprite( particleMaterial );
			particle.position.copy( intersects[ 0 ].point );
			particle.scale.x = particle.scale.y = 16;
			scope.scene.add( particle );*/


		} else {
			scope.scene.selected = null;
		}



		/*
		// Parse all the faces
		for ( var i in intersects ) {

			intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

		}
		*/
	}


	scope.canvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
	scope.canvas.addEventListener( 'touchstart', onDocumentTouchStart, false );


}

View3D.prototype.refresh = function(){

	let dom = this.dom;

	this.canvas.setAttribute('style', '');
	this.canvas.width = dom.clientWidth;
	this.canvas.height = dom.clientHeight;

	this.renderer.setSize(this.canvas.width, this.canvas.height );

	this.camera.aspect = this.canvas.width / this.canvas.height;
	this.camera.updateProjectionMatrix();


	this.center = [
		this.canvas.width/2,
		this.canvas.height/2
	];


	this.renderer.render( this.scene, this.camera );


	// draw text
	/*
	this.ctx.font="16px Arial";
	this.ctx.fillStyle="#999";
	this.ctx.fillText(this.perspective,15,25);
	*/

};

export default View3D;
