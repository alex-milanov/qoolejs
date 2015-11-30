"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.gui === "undefined"){ QL.gui = {}; }

QL.gui.View3D = function(conf, scene){
	QL.gui.Element.call(this, conf.dom);
	
	this.canvas = $(this.dom).find(".layer-3d")[0];
	this.perspective = conf.perspective;

	this.canvas.width = $(this.canvas).width();
	this.canvas.height = $(this.canvas).height();
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

QL.gui.View3D.prototype = Object.create( QL.gui.Element.prototype );
QL.gui.View3D.prototype.constructor = QL.gui.View3D;

QL.gui.View3D.prototype.addBlock = function(entity){

	var width = entity.finish[0]-entity.start[0];
	var height = entity.finish[1]-entity.start[1];
	var depth = entity.finish[2]-entity.start[2];

	var pos = {
		x: (entity.start[0]+width/2),
		y: (entity.start[1]+height/2),
		z: (entity.start[2]+depth/2)
	};

	var geometry = new QL.ext.BoxGeometry( width, height, depth );
	var color = entity.color || 0x777777;
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
	var mesh = new QL.ext.Mesh( geometry, material );
	mesh.position.set( pos.x, pos.y, pos.z );
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	if(entity.name){
		mesh.name = entity.name;
	}

	this.scene.add( mesh );
};

QL.gui.View3D.prototype.addEntities = function(entities){

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

QL.gui.View3D.prototype.init = function(){
	QL.gui.Element.prototype.init.call(this);
}

QL.gui.View3D.prototype.refresh = function(){


	$(this.canvas).attr("style","");
	this.canvas.width = $(this.dom).width();
	this.canvas.height = $(this.dom).height();

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
