"use strict";


function QLView3D(_conf){
	this.canvas = $(_conf.canvas)[0];
	//this.ctx = this.canvas.getContext("2d");
	this.perspective = _conf.perspective;
	this.center = [
		this.canvas.width/2,
		this.canvas.height/2
	]
	this.canvas.width	= window.innerWidth/2;
	this.canvas.height = window.innerHeight/2;
	

	this.keyboard = new THREEx.KeyboardState();

	this.renderer = new THREE.WebGLRenderer({
		canvas: this.canvas
	});

	this.renderer.setSize(this.canvas.width, this.canvas.height );

	this.scene = new THREE.Scene();

	this.scene.fog = new THREE.Fog( 0x33373f, 500, 10000 );


	this.camera = new THREE.PerspectiveCamera( 75, this.canvas.width / this.canvas.height, 1, 10000 );
	this.camera.position.z = 300;
	this.camera.position.y = 50;
	

	this.scene.add(this.camera);


	// lights
	var light;

	//this.scene.add( new THREE.AmbientLight( 0x555555 ) );

	light = new THREE.DirectionalLight( 0xdfebff, 1.8 );
	light.position.set( 40, 100, 40 );
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


	//this.scene.add( light );

	this.renderer.setClearColor( this.scene.fog.color );

	this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;

	this.renderer.shadowMapEnabled = true;
}

QLView3D.prototype.addBlock = function(_entity){

	var width = _entity.finish[0]-_entity.start[0];
	var height = _entity.finish[1]-_entity.start[1];
	var depth = _entity.finish[2]-_entity.start[2];

	var pos = {
		x: (_entity.start[0]+width/2),
		y: (_entity.start[1]+height/2),
		z: (_entity.start[2]+depth/2)
	}

	var geometry = new THREE.BoxGeometry( width, height, depth );
	var material = new THREE.MeshBasicMaterial( { color: 0x777777, wireframe: false } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( pos.x, pos.y, pos.z );
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	this.scene.add( mesh );
} 

QLView3D.prototype.addEntities = function(_entities){

	var that = this;
	_entities.forEach(function(_entity){
		switch(_entity.type){
			case "cube":
				that.addCube(_entity);
				break;
			case "block":
				that.addBlock(_entity);
				break;
		}
	})
}

QLView3D.prototype.animate = function(){
	
	
	var _view = this;

	function animStep(){
		_view.canvas.width	= window.innerWidth/2;
		_view.canvas.height = window.innerHeight/2;

		_view.renderer.setSize(_view.canvas.width, _view.canvas.height );

		_view.camera.aspect = _view.canvas.width / _view.canvas.height;
		_view.camera.updateProjectionMatrix()
		
		requestAnimationFrame( animStep );

		_view.center = [
			_view.canvas.width/2,
			_view.canvas.height/2
		]


		_view.renderer.render( _view.scene, _view.camera );
	
	}

	animStep();

	// draw text
	/*
	this.ctx.font="16px Arial";
	this.ctx.fillStyle="#999";
	this.ctx.fillText(this.perspective,15,25);
	*/
	
}