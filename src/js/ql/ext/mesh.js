import THREE from 'three';

export default class Mesh extends THREE.Mesh {
	clone() {
		var geometry = this.geometry.clone();
		var material = this.material.clone();

		return new Mesh(geometry, material).copy(this);
	}
}
