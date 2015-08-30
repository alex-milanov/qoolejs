"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }

QL.gui.View3D = function(_conf, _scene){
	this._dom = $(_conf.dom)[0];
	this.canvas = $(this._dom).find(".layer-3d")[0];
	this.perspective = _conf.perspective;

	this.canvas.width = $(this.canvas).width();
	this.canvas.height = $(this.canvas).height();
	this.center = [
		this.canvas.width/2,
		this.canvas.height/2
	];

	if(typeof _scene === "undefined"){
		this.scene = new THREE.Scene();
	} else {
		this.scene = _scene;
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

	this.renderer.shadowMapEnabled = true;
};

QL.gui.View3D.prototype.addBlock = function(_entity){

	var width = _entity.finish[0]-_entity.start[0];
	var height = _entity.finish[1]-_entity.start[1];
	var depth = _entity.finish[2]-_entity.start[2];

	var pos = {
		x: (_entity.start[0]+width/2),
		y: (_entity.start[1]+height/2),
		z: (_entity.start[2]+depth/2)
	};

	var geometry = new QL.ext.BoxGeometry( width, height, depth );
	var color = _entity.color || 0x777777;
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
	var mesh = new QL.ext.Mesh( geometry, material );
	mesh.position.set( pos.x, pos.y, pos.z );
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	if(_entity.name){
		mesh.name = _entity.name;
	}

	this.scene.add( mesh );
};

QL.gui.View3D.prototype.addEntities = function(_entities){

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
	});
};

QL.gui.View3D.prototype.refresh = function(){


	$(this.canvas).attr("style","");
	this.canvas.width = $(this._dom).width();
	this.canvas.height = $(this._dom).height();

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
