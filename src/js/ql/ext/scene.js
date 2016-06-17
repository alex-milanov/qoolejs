'use strict';

import THREE from 'three';
import BoxGeometry from './box-geometry';
import Mesh from './mesh';

var Scene = function () {

	THREE.Scene.call( this );

	this.selected = false;

};

Scene.prototype = Object.create( THREE.Scene.prototype );
Scene.prototype.constructor = Scene;


Scene.prototype.select = function(_objId){

	if(!this.selected || this.selected.id !== _objId){
		this.selected = this.getObjectById(_objId);
	} else {
		this.selected = null;
	}
};

Scene.prototype.selectNext = function(direction){
	if(this.children.length == 0){
		return false;
	}

	if(!direction)
		direction = 1;

	var index = this.children.indexOf(this.selected);

	var indexToBeSelected = index + direction;

	var nextToBeSelected = false;
	var iterations = 0;
	while(!(nextToBeSelected && nextToBeSelected.id && nextToBeSelected.type == "Mesh") && (iterations < this.children.length)){

		nextToBeSelected = this.children[indexToBeSelected];

		if((direction == 1 && indexToBeSelected < this.children.length - 1) ||
			(direction == -1 && indexToBeSelected > 0)){
			indexToBeSelected+= direction;
		} else if (direction == 1 ) {
			indexToBeSelected = 0;
		} else {
			indexToBeSelected = this.children.length - 1;
		}
		iterations++;
	}

	if(nextToBeSelected && nextToBeSelected.id && nextToBeSelected.type == "Mesh")
		this.selected = nextToBeSelected;

}


Scene.prototype.newMesh = function(){
	var meshName = "Block "+this.children.length;
	this.addEntities([
		{
			name: (meshName),
			type: "block",
			start: [-20,-20,-20],
			finish: [20,20,20],
			color: 0x113311
		},
	]);
	var mesh = this.getObjectByName(meshName);
	this.select(mesh.id);
	return mesh;
};

Scene.prototype.cloneObject = function(_mod){

	if(!this.selected){
		return false;
	}

	var mesh = this.selected.clone();
	mesh.name = "Block "+this.children.length;

	this.selected.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale)

	mesh.position.set(0,0,0);
	mesh.position[_mod.w] = this.selected.position[_mod.w];

	this.add(mesh);
	this.select(this.getObjectByName(mesh.name).id);

	return mesh;
};

Scene.prototype.clear = function(){

	// extract non mesh children
	var newChildren = [];

	this.children.forEach(function(child){
		if(child.type !== "Mesh"){
			newChildren.push(child);
		}
	})

	this.children = newChildren;
	this.selected = null;
};

Scene.prototype.addBlock = function(_entity){

	var width = _entity.finish[0]-_entity.start[0];
	var height = _entity.finish[1]-_entity.start[1];
	var depth = _entity.finish[2]-_entity.start[2];

	var pos = {
		x: (_entity.start[0]+width/2),
		y: (_entity.start[1]+height/2),
		z: (_entity.start[2]+depth/2)
	};

	var geometry = new BoxGeometry( width, height, depth );
	var color = _entity.color || 0x777777;
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
	var mesh = new Mesh( geometry, material );
	mesh.position.set( pos.x, pos.y, pos.z );
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	if(_entity.name){
		mesh.name = _entity.name;
	}

	this.add( mesh );
};

Scene.prototype.addEntities = function(_entities){

	var that = this;
	_entities.forEach(function(_entity){
		switch(_entity.type){
			case "block":
				that.addBlock(_entity);
				break;
		}
	});
};

Scene.prototype.load = function(data){

	var loader = new THREE.ObjectLoader();

	var scene = loader.parse(data)

	this.uuid = scene.uuid;
	this.name = scene.name;

	var scope = this;


	// clear the current scene
	scope.clear();

	scene.children.forEach(function(child){
		// load only meshes for now
		if(child.type === "Mesh"){
			var geometry = child.geometry.clone();
			var material = child.material.clone();
			if(geometry.type === "BoxGeometry"){
				geometry = new BoxGeometry().clone(geometry.parameters)
			}
			var mesh = new Mesh( geometry, material );
			child.updateMatrix();
			child.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale )
			mesh.updateMatrix();
			mesh.name = child.name;
			scope.add(mesh);
		}
	})
}

export default Scene;
