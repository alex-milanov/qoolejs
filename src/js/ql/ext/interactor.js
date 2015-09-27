"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.interactor = {
	"move": function(object3d, interactionVector, modifier){
		object3d.position.add(interactionVector);
		object3d.updateMatrix();
	},

	"rotate": function(object3d, interactionVector, modifier){
		object3d.rotation.z += QL.etc.Math.radians(interactionVector.z);
		object3d.rotation.x += QL.etc.Math.radians(interactionVector.x);
		object3d.rotation.y += QL.etc.Math.radians(interactionVector.y);
		object3d.updateMatrix();
	},

	"scale": function(object3d, interactionVector, modifier){
		object3d.scale.add(interactionVector);
		object3d.updateMatrix();
	}
}