'use strict';

import ext from '../ext';
import Element from './element';
import THREE from 'three';

export default class View3D extends Element {
	constructor(conf, scene, editor) {
		super(conf.dom);

		let dom = this.dom;

		this.canvas = dom.querySelector(".layer-3d");
		this.perspective = conf.perspective;

		this.editor = editor;

		this.canvas.width = dom.clientWidth;
		this.canvas.height = dom.clientHeight;
		this.center = [
			this.canvas.width / 2,
			this.canvas.height / 2
		];

		if (typeof scene === "undefined") {
			this.scene = new THREE.Scene();
		} else {
			this.scene = scene;
		}

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		this.renderer.setSize(this.canvas.width, this.canvas.height);

		this.scene.fog = new THREE.Fog(0x33373f, 500, 10000);

		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 1, 10000);
		this.camera.position.z = 300;
		this.camera.position.y = 50;

		this.scene.add(this.camera);

		// lights
		var light;

		// this.scene.add( new THREE.AmbientLight( 0x555555 ) );

		light = new THREE.DirectionalLight(0xdfebff, 1.8);
		light.position.set(40, 50, 40);
		light.position.multiplyScalar(1.3);

		light.castShadow = true;
		// light.shadowCameraVisible = true;

		light.shadowMapWidth = 1024;
		light.shadowMapHeight = 1024;

		var d = 300;

		light.shadowCameraLeft = -d;
		light.shadowCameraRight = d;
		light.shadowCameraTop = d;
		light.shadowCameraBottom = -d;

		light.shadowCameraFar = 1000;
		light.shadowDarkness = 0.5;

		this.scene.add(light);

		var grid = new THREE.GridHelper(500, 25);
		this.scene.add(grid);

		// this.scene.add( light );

		this.renderer.setClearColor(this.scene.fog.color);

		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		// this.renderer.shadowMap.cullFace = THREE.CullFaceBack;
		// this.renderer.shadowMap.enabled = true;

		this.selectionHelper = null;
		this._selectionId = null;
		this._selectionMode = null;
		this._selectionFaceId = null;
		this._selectionFacePrev = null;
	}

	selectionColor() {
		switch (this.editor.params['obj-mode']) {
			case 'scale':
				return 0xDCDC33;
			case 'rotate':
				return 0x33DC33;
			case 'move':
			default:
				return 0xDC3333;
		}
	}

	clearSelectionFaces() {
		if (this._selectionFaceId == null) return;
		const prev = this.scene.getObjectById(this._selectionFaceId);
		if (prev && prev.material && this._selectionFacePrev) {
			prev.material.opacity = this._selectionFacePrev.opacity;
			prev.material.transparent = this._selectionFacePrev.transparent;
		}
		this._selectionFaceId = null;
		this._selectionFacePrev = null;
	}

	applySelectionFaces(mesh) {
		if (this._selectionFaceId === mesh.id) return;
		this.clearSelectionFaces();
		this._selectionFacePrev = {
			opacity: mesh.material.opacity,
			transparent: mesh.material.transparent
		};
		mesh.material.transparent = true;
		mesh.material.opacity = 0.9;
		this._selectionFaceId = mesh.id;
	}

	clearSelectionHelper() {
		this.clearSelectionFaces();
		if (this.selectionHelper) {
			this.scene.remove(this.selectionHelper);
			if (this.selectionHelper.geometry) this.selectionHelper.geometry.dispose();
			if (this.selectionHelper.material) this.selectionHelper.material.dispose();
			this.selectionHelper = null;
		}
		this._selectionId = null;
		this._selectionMode = null;
	}

	updateSelectionHelper() {
		const selected = this.scene.selected;
		const selectedId = selected && selected.type === 'Mesh' ? selected.id : null;
		const mode = this.editor.params['obj-mode'];

		if (!selectedId) {
			this.clearSelectionHelper();
			return;
		}

		this.applySelectionFaces(selected);

		if (this._selectionId !== selectedId || this._selectionMode !== mode) {
			// Rebuild edges only; keep face opacity via applySelectionFaces above
			if (this.selectionHelper) {
				this.scene.remove(this.selectionHelper);
				if (this.selectionHelper.geometry) this.selectionHelper.geometry.dispose();
				if (this.selectionHelper.material) this.selectionHelper.material.dispose();
				this.selectionHelper = null;
			}
			selected.updateMatrixWorld(true);
			this.selectionHelper = new THREE.BoxHelper(selected, this.selectionColor());
			this.selectionHelper.name = '__selectionHelper';
			this.selectionHelper.userData.selectionHelper = true;
			// Draw on top of the mesh (match 2D selection overlay visibility)
			this.selectionHelper.material.depthTest = false;
			this.selectionHelper.material.transparent = true;
			this.selectionHelper.renderOrder = 999;
			this.selectionHelper.frustumCulled = false;
			this.scene.add(this.selectionHelper);
			this._selectionId = selectedId;
			this._selectionMode = mode;
		} else if (this.selectionHelper) {
			selected.updateMatrixWorld(true);
			this.selectionHelper.update(selected);
		}
	}

	addBlock(entity) {
		var width = entity.finish[0] - entity.start[0];
		var height = entity.finish[1] - entity.start[1];
		var depth = entity.finish[2] - entity.start[2];

		var pos = {
			x: (entity.start[0] + width / 2),
			y: (entity.start[1] + height / 2),
			z: (entity.start[2] + depth / 2)
		};

		var geometry = new ext.BoxGeometry(width, height, depth);
		var color = entity.color || 0x777777;
		var material = new THREE.MeshBasicMaterial({color: color, wireframe: false});
		var mesh = new ext.Mesh(geometry, material);
		mesh.position.set(pos.x, pos.y, pos.z);
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		if (entity.name) {
			mesh.name = entity.name;
		}

		this.scene.add(mesh);
	}

	addEntities(entities) {
		var that = this;
		entities.forEach(function(entity) {
			switch (entity.type) {
				case "cube":
					that.addCube(entity);
					break;
				case "block":
					that.addBlock(entity);
					break;
				default:
					break;
			}
		});
	}

	init() {
		super.init();

		var scope = this;

		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();

		function onDocumentTouchStart(event) {
			event.preventDefault();

			event.offsetX = event.touches[0].offsetX;
			event.offsetY = event.touches[0].offsetY;
			onDocumentMouseDown(event);
		}

		function onDocumentMouseDown(event) {
			event.preventDefault();

			scope.editor.selectView(scope);

			mouse.x = event.offsetX / scope.canvas.clientWidth * 2 - 1; // ( event.clientX / scope.canvas.clientWidth ) * 2 - 1;
			mouse.y = -event.offsetY / scope.canvas.clientHeight * 2 + 1; // ( event.clientY / scope.canvas.clientHeight ) * 2 + 1;

			raycaster.setFromCamera(mouse, scope.camera);

			var objects = [];
			scope.scene.children.forEach(function(child) {
				if (child.type === "Mesh") {
					objects.push(child);
				}
			});

			var intersects = raycaster.intersectObjects(objects);

			if (intersects.length > 0) {
				if (!scope.scene.selected) {
					scope.editor.select(intersects[0].object.id);
				} else {
					var selectedIndex = -1;
					intersects.forEach(function(intersect, index) {
						if (intersect.object.id === scope.scene.selected.id) {
							selectedIndex = index;
						}
					});

					if (selectedIndex + 1 >= intersects.length) {
						scope.editor.select(intersects[0].object.id);
					} else {
						scope.editor.select(intersects[selectedIndex + 1].object.id);
					}
				}

				/* var particle = new THREE.Sprite( particleMaterial );
				particle.position.copy( intersects[ 0 ].point );
				particle.scale.x = particle.scale.y = 16;
				scope.scene.add( particle );*/
			} else {
				scope.scene.selected = null;
				scope.editor.panel.refresh();
			}

			/*
			// Parse all the faces
			for ( var i in intersects ) {

				intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

			}
			*/
		}

		scope.canvas.addEventListener('mousedown', onDocumentMouseDown, false);
		scope.canvas.addEventListener('touchstart', onDocumentTouchStart, false);
	}

	refresh() {
		let dom = this.dom;

		this.canvas.setAttribute('style', '');
		this.canvas.width = dom.clientWidth;
		this.canvas.height = dom.clientHeight;

		this.renderer.setSize(this.canvas.width, this.canvas.height);

		this.camera.aspect = this.canvas.width / this.canvas.height;
		this.camera.updateProjectionMatrix();

		this.center = [
			this.canvas.width / 2,
			this.canvas.height / 2
		];

		this.updateSelectionHelper();
		this.renderer.render(this.scene, this.camera);

		// draw text
		/*
		this.ctx.font="16px Arial";
		this.ctx.fillStyle="#999";
		this.ctx.fillText(this.perspective,15,25);
		*/
	}
}
