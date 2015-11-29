"use strict";


if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.ext === "undefined"){ QL.ext = {}; }

QL.ext.interactor = {
	move: function(object3d, v3){
		object3d.position.add(v3);
		object3d.updateMatrix();
	},

	rotate: function(object3d, v3){
		object3d.rotation.z += QL.etc.Math.radians(v3.z);
		object3d.rotation.x += QL.etc.Math.radians(v3.x);
		object3d.rotation.y += QL.etc.Math.radians(v3.y);
		object3d.updateMatrix();
	},

	scale: function(object3d, v3){
		v3.x = ((object3d.scale.x + v3.x) > 0 ) ? v3.x : 0;
		v3.y = ((object3d.scale.y + v3.y) > 0 ) ? v3.y : 0;
		v3.z = ((object3d.scale.z + v3.z) > 0 ) ? v3.z : 0;
		object3d.scale.add(v3);
		object3d.updateMatrix();
	},

	lookAt:  function(object3d, v3){
		object3d.lookAt(v3);
		object3d.updateMatrix();
	}


}