
import THREE from 'three';
import Vector2 from './vector2';

export default class Vector3 extends THREE.Vector3 {
	toVector2(mod) {
		const v2 = new Vector2(
			this[mod.u] * mod.xD,
			this[mod.v] * mod.yD
		);
		return v2;
	}
	clone() {
		return new Vector3(this.x, this.y, this.z);
	}
}
