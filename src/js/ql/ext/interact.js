"use strict";

const	move = (object3d, v3) => {
	object3d.position.add(v3);
	object3d.updateMatrix();
};

const rotate = (object3d, v3) => {
	object3d.rotation.z += QL.etc.Math.radians(v3.z);
	object3d.rotation.x += QL.etc.Math.radians(v3.x);
	object3d.rotation.y += QL.etc.Math.radians(v3.y);
	object3d.updateMatrix();
};

const scale = (object3d, v3) => {
	v3.x = ((object3d.scale.x + v3.x) > 0 ) ? v3.x : 0;
	v3.y = ((object3d.scale.y + v3.y) > 0 ) ? v3.y : 0;
	v3.z = ((object3d.scale.z + v3.z) > 0 ) ? v3.z : 0;
	object3d.scale.add(v3);
	object3d.updateMatrix();
};

const lookAt = (object3d, v3) => {
	object3d.lookAt(v3);
	object3d.updateMatrix();
};

export default {
	move,
	rotate,
	scale,
	lookAt
};
