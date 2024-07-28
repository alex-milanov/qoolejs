'use strict';

import THREE from 'three';
import Vector3 from './vector3';

export default class Vector2 extends THREE.Vector2 {
	toVector3(mod, v3 = new Vector3()) {
		v3[mod.u] = mod.xD * this.x;
		v3[mod.v] = mod.yD * this.y;

		return v3;
	}

	clone() {
		return new Vector2(this.x, this.y);
	}
}
