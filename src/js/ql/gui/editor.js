'use strict';

import iblokz from '../../iblokz';
import ext from '../ext';
import etc from '../etc';
import Element from './element';
import Toolbar from './toolbar';
import Panel from './panel';
import View3D from './view3d';
import View2D from './view2d';

import THREE from 'three';

export default class Editor extends Element {
	constructor(_views, _entities) {
		super('body');

		this.params = {
			"obj-mode": "move"
		};

		this.history = new etc.History();

		this.entities = _entities;

		this.keyboard = {};

		// init scene
		this.scene = new ext.Scene();

		// init views
		this.views = Object.keys(_views).map(key => _views[key])
			.map(viewConf =>
				viewConf.perspective === '3d'
					? new View3D(viewConf, this.scene, this)
					: new View2D(viewConf, this.scene, this)
			);

		this.selectView(this.views[0]);

		this.panel = new Panel(".panel.left", this);
		this.toolbar = new Toolbar(".toolbar", this);

		this.scene.addEntities(_entities);
	}

	init() {
		var _editor = this;
		_editor.keyboard = {};// new THREEx.KeyboardState();

		let dom = this.dom;

		let interractionKeys = ['Shift', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'PageUp', 'PageDown'];
		let interraction = [];

		dom.addEventListener("keydown", event =>
			interractionKeys.indexOf(event.key) > -1
				&& interraction.indexOf(event.key) === -1
					&& interraction.push(event.key)
			// console.log(interraction);
		);

		dom.addEventListener("keyup", event =>
			interractionKeys.indexOf(event.key) > -1
				&& interraction.indexOf(event.key) > -1
					&& ((
						interraction = interraction.filter(key => key !== event.key)
					),	true)
				// console.log(interraction);
		);

		function animStep() {
			requestAnimationFrame(animStep);

			// refresh sub views
			_editor.views.forEach(view => view.refresh(_editor.scene));

			let keyCombo = '';
			// if (interraction.length > 0) console.log(interraction);

			const focusedElements = [].slice.call(dom.querySelectorAll(':focus'));

			if (focusedElements.length === 0 && interraction.length > 0) {
				let interactionVector = new ext.Vector3(0, 0, 0);

				const force = interraction.indexOf('Shift') > -1 ? 10 : 2.5;

				if (interraction.indexOf("ArrowUp") > -1) {
					interactionVector.z -= force;
				}
				if (interraction.indexOf("ArrowDown") > -1) {
					interactionVector.z += force;
				}
				if (interraction.indexOf("ArrowLeft") > -1) {
					interactionVector.x -= force;
				}
				if (interraction.indexOf("ArrowRight") > -1) {
					interactionVector.x += force;
				}
				if (interraction.indexOf("PageUp") > -1) {
					interactionVector.y += force;
				}
				if (interraction.indexOf("PageDown") > -1) {
					interactionVector.y -= force;
				}

				if (_editor.scene.selected) {
					switch (_editor.params['obj-mode']) {
						case "move":
							ext.interact.move(_editor.scene.selected, interactionVector);
							_editor.interact("move", interactionVector);
							break;
						case "scale":
							interactionVector.z = -interactionVector.z;
							interactionVector.divideScalar(20 / force * 2.5);
							break;
						case "rotate":
							var rotationVector = new ext.Vector3();
							rotationVector.z = -interactionVector.x;
							rotationVector.x = interactionVector.z;
							rotationVector.y = -interactionVector.y;
							interactionVector.copy(rotationVector);
							break;
						default:
							break;
					}
					_editor.interact(_editor.params['obj-mode'], interactionVector);
				} else if (_editor.activeView.perspective !== "3d") {
					_editor.activeView.offset.x -= interactionVector.x;
					_editor.activeView.offset.y -= interactionVector.z;
					_editor.activeView.zoom += interactionVector.y;

					_editor.activeView.needRefreshingAll();
				} else {
					_editor.activeView.camera.position.add(interactionVector);
				}

				_editor.refreshObjectPane();

				keyCombo = interraction.join(" + ");
			}

			// keyboard interactions
			/*
			if(jQuery(_editor.dom).find(':focus').length === 0) {

				var interactionVector = new ext.Vector3(0,0,0);

				var force = _editor.keyboard.pressed("shift") ? 10 : 2.5;

				// initial object interaction
				if(_editor.keyboard.pressed("up")
					|| _editor.keyboard.pressed("down")
					|| _editor.keyboard.pressed("left")
					|| _editor.keyboard.pressed("right")
					|| _editor.keyboard.pressed("pageup")
					|| _editor.keyboard.pressed("pagedown")){
					var keys = [];
					if(_editor.keyboard.pressed("up")){
						interactionVector.z -= force;
						keys.push("Up");
					}
					if(_editor.keyboard.pressed("down")){
						interactionVector.z += force;
						keys.push("Down");
					}
					if(_editor.keyboard.pressed("left")){
						interactionVector.x -= force;
						keys.push("Left");
					}
					if(_editor.keyboard.pressed("right")){
						interactionVector.x += force;
						keys.push("Right");
					}
					if(_editor.keyboard.pressed("pageup")){
						interactionVector.y += force;
						keys.push("PgUp");
					}
					if(_editor.keyboard.pressed("pagedown")){
						interactionVector.y -= force;
						keys.push("PgDown");
					}

					if(_editor.scene.selected) {
						switch(_editor.params['obj-mode']){
							case "move":
								//ext.interact.move(_editor.scene.selected, interactionVector);
								//_editor.interact("move", interactionVector);
								break;
							case "scale":
								interactionVector.z = -interactionVector.z;
								interactionVector.divideScalar(20/force*2.5);
								break;
							case "rotate":
								var rotationVector = new ext.Vector3();
								rotationVector.z = -interactionVector.x;
								rotationVector.x = interactionVector.z;
								rotationVector.y = -interactionVector.y;
								interactionVector.copy(rotationVector);
								break;
						}
						_editor.interact(_editor.params['obj-mode'], interactionVector);
					} else {
						if(_editor.activeView.perspective!=="3d"){
							_editor.activeView.offset.x -= interactionVector.x;
							_editor.activeView.offset.y -= interactionVector.z;
							_editor.activeView.zoom += interactionVector.y;

							_editor.activeView.needRefreshingAll();
						} else {
							_editor.activeView.camera.position.add(interactionVector);

						}
					}

					_editor.refreshObjectPane();

					keyCombo = keys.join(" + ");
				}
			}
			*/

			if (keyCombo !== ''
				&& dom.querySelector('.debug-keys')
				&& dom.querySelector('.debug-keys').textContent !== keyCombo) {
				dom.querySelector('.debug-keys').textContent = ' ' + keyCombo;
			}
		}

		// keyboard triggers
		dom.addEventListener("keyup", function(event) {
			var keyCode = event.keyCode;
			var keyCombo = "";

			const focusedElements = [].slice.call(dom.querySelectorAll(':focus'));

			// desselect and blur on esc
			if (keyCode === 27) {
				if (focusedElements.length > 0) {
					focusedElements.map(el => el.blur());
				} else {
					_editor.scene.selected = false;
					_editor.refreshObjectPane();
				}
				keyCombo = "ESC";
			}

			if (focusedElements.length === 0) {
				// undo/redo
				if (event.ctrlKey && keyCode === "Z".charCodeAt(0)) {
					_editor.history.undo();
					keyCombo = "Ctrl+Z";
				}
				if (event.ctrlKey && keyCode === "Y".charCodeAt(0)) {
					_editor.history.redo();
					keyCombo = "Ctrl+Y";
				}

				// focus on object pane
				if (keyCode === "E".charCodeAt(0)) {
					dom.querySelector("#object-pane-name").focus();
					keyCombo = "E";
				}

				if (keyCode === "T".charCodeAt(0)) {
					_editor.activeView.zoom = 100;
					_editor.activeView.offset.set(0, 0);
					keyCombo = "T";
				}

				if (keyCode === "F".charCodeAt(0)) {
					_editor.activeView.dom.querySelector(".fullscreen-toggle").click();
					keyCombo = "F";
				}

				// select prev
				if (keyCode === 219) {
					if (event.shiftKey === true) {
						_editor.selectNextView(-1);
						keyCombo = "Shift + [";
					} else {
						_editor.selectNext(-1);
						keyCombo = "[";
					}
				}

				// select next on tab
				if (keyCode === 221) {
					if (event.shiftKey === true) {
						_editor.selectNextView(1);
						keyCombo = "Shift + ]";
					} else {
						_editor.selectNext(1);
						keyCombo = "]";
					}
				}

				// mode change
				if (keyCode === "M".charCodeAt(0)) {
					_editor.changeMode("move");
					keyCombo = "M";
				} else if (keyCode === "R".charCodeAt(0)) {
					_editor.changeMode("rotate");
					keyCombo = "R";
				} else if (keyCode === "S".charCodeAt(0)) {
					_editor.changeMode("scale");
					keyCombo = "S";
				}

				// object creation
				if (keyCode === "N".charCodeAt(0)) {
					_editor.newMesh();
					keyCombo = "N";
				}
				if (keyCode === "C".charCodeAt(0)) {
					_editor.cloneObject();
					keyCombo = "C";
				}
				if (event.key === 'Delete') {
					_editor.removeObject();
					keyCombo = "Delete";
				}
				if (keyCode === "L".charCodeAt(0)) {
					_editor.clearScene();
					keyCombo = "L";
				}
			}

			if (keyCombo !== ''
				&& dom.querySelector(".debug-keys")
				&& (dom.querySelector(".debug-keys").textContent !== keyCombo)) {
				dom.querySelector(".debug-keys").textContent = " " + keyCombo;
			}
		}, false);

		animStep();

		this.panel.init();
		this.toolbar.init();

		this.views.forEach(function(view) {
			view.init();
		});

		this.panel.refresh();
	}

	changeMode(mode) {
		if (this.params['obj-mode'] !== mode) {
			this.params['obj-mode'] = mode;
			[].slice.call(
				this.dom.querySelectorAll("a.obj-mode-option[data-option-param='obj-mode']")
			).map(el =>
				el.classList.remove("selected")
			);
			this.dom.querySelector(
				"a.obj-mode-option[data-option-param='obj-mode'][data-option-value='" + mode + "']"
			).classList.add("selected");
		}
	}

	interact(action, v3) {
		var preMatrix = new THREE.Matrix4();
		var selected = this.scene.selected;

		preMatrix.copy(selected.matrix);

		// apply action
		ext.interact[action](selected, v3);

		var editor = this;

		// -> setTimeOut

		if (preMatrix.equals(selected.matrix) === false) {
			(function(matrix1, matrix2) {
				editor.history.add(
					function() {
						matrix1.decompose(selected.position, selected.quaternion, selected.scale);
						// signals.objectChanged.dispatch( object );
					},
					function() {
						matrix2.decompose(selected.position, selected.quaternion, selected.scale);
						// signals.objectChanged.dispatch( object );
					},
					action + " " + selected.id // title
				);
			})(preMatrix.clone(), selected.matrix.clone());
		}
	}

	selectView(view) {
		this.activeView = view;
		[].slice.call(
			this.dom.querySelectorAll('.views .view')
		).map(el =>
			el.classList.remove('selected')
		);
		this.activeView.dom.classList.add('selected');
	}

	selectNextView(direction) {
		var index = this.views.indexOf(this.activeView);

		index += direction;

		if (direction === 1 && index === this.views.length) {
			index = 0;
		} else if (direction === -1 && index === -1) {
			index = this.views.length - 1;
		}

		this.selectView(this.views[index]);
	}

	select(_objId) {
		this.scene.select(_objId);
		this.panel.refresh();
	}

	selectNext(direction) {
		this.scene.selectNext(direction);
		this.panel.refresh();
	}

	newMesh() {
		var mesh = this.scene.newMesh();
		this.panel.refresh();

		var action = "new mesh" + mesh.id;

		this.history.add(
			() => {
				this.scene.remove(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			() => {
				this.scene.add(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			action
		);
	}

	cloneObject() {
		if (!this.scene.selected)
			return false;

		var mesh = this.scene.cloneObject(this.activeView.mod);
		this.panel.refresh();

		var action = "clone object" + mesh.id;

		this.history.add(
			() => {
				this.scene.remove(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			() => {
				this.scene.add(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			action
		);
	}

	removeObject() {
		if (!this.scene.selected)
			return false;

		var mesh = this.scene.selected.clone();
		this.scene.remove(this.scene.selected);
		this.scene.selected = null;
		this.panel.refresh();

		console.log(mesh);

		var action = "delete object" + mesh.id;

		this.history.add(
			() => {
				this.scene.add(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			() => {
				this.scene.remove(mesh);
				this.scene.selected = null;
				this.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			action
		);
	}

	updateObject(objId) {
		if (!objId) {
			return false;
		}

		var selected = this.scene.selected;
		let editor = this;

		var oldObjState = {
			name: selected.name,
			matrix: selected.matrix.clone(),
			material: selected.material.clone()
		};

		selected.name = this.dom.querySelector("#object-pane-name").value;
		selected.position.x = parseFloat(this.dom.querySelector("#object-pane-pos-x").value);
		selected.position.y = parseFloat(this.dom.querySelector("#object-pane-pos-y").value);
		selected.position.z = parseFloat(this.dom.querySelector("#object-pane-pos-z").value);
		// scale
		selected.scale.x = parseFloat(this.dom.querySelector("#object-pane-scale-x").value);
		selected.scale.y = parseFloat(this.dom.querySelector("#object-pane-scale-y").value);
		selected.scale.z = parseFloat(this.dom.querySelector("#object-pane-scale-z").value);
		// rotation
		selected.rotation.x = etc.math.radians(
			Number(this.dom.querySelector("#object-pane-rotation-x").value));
		selected.rotation.y = etc.math.radians(
			Number(this.dom.querySelector("#object-pane-rotation-y").value));
		selected.rotation.z = etc.math.radians(
			Number(this.dom.querySelector("#object-pane-rotation-z").value));

		selected.updateMatrix();

		selected.material.color.setStyle(this.dom.querySelector("#object-pane-color").value);
		this.panel.refresh();

		var action = "update object " + selected.id;

		(function(obj1, obj2) {
			editor.history.add(
				function() {
					obj1.matrix.decompose(selected.position, selected.quaternion, selected.scale);
					selected.name = obj1.name;
					selected.material.copy(obj1.material);
					editor.panel.refresh();
					// signals.objectChanged.dispatch( object );
				},
				function() {
					obj2.matrix.decompose(selected.position, selected.quaternion, selected.scale);
					selected.name = obj2.name;
					selected.material.copy(obj2.material);
					editor.panel.refresh();
				},
				action
			);
		})(oldObjState, {
			name: selected.name,
			matrix: selected.matrix.clone(),
			material: selected.material.clone()
		});
	}

	loadScene() {
		var fileLoader = document.createElement('input');
		fileLoader.setAttribute('type', 'file');

		var editor = this;

		fileLoader.addEventListener('change', function() {
			var file = this.files[0];
			var fr = new FileReader();
			fr.onload = receivedText;
			fr.readAsText(file);
			function receivedText(e) {
				var data = JSON.parse(e.target.result);
				editor.scene.load(data);
				editor.history.clear();
				editor.panel.refresh();
				editor.dom.querySelector("#scene-title").textContent = file.name;
			}
		});

		fileLoader.click();
	}

	saveScene() {
		var blob = new Blob([JSON.stringify(this.scene.toJSON())], {type: "text/plain;charset=utf-8"});
		window.saveAs(blob, "scene.json");
	}

	newScene() {
		this.clearScene();
		this.history.clear();
		this.dom.querySelector('#scene-title').textContent = 'Untitled';
	}

	clearScene() {
		var children = this.scene.children.slice();

		this.scene.clear();
		this.panel.refresh();

		var editor = this;

		var action = "clear scene";

		editor.history.add(
			function() {
				children.forEach(function(child) {
					if (child.type === "Mesh") {
						editor.scene.children.push(child);
					}
				});
				editor.scene.selected = null;
				editor.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			function() {
				editor.scene.clear();
				editor.panel.refresh();
				// signals.objectChanged.dispatch( object );
			},
			action
		);
	}

	undo() {
		this.history.undo();
	}

	redo() {
		this.history.redo();
	}

	refreshObjectPane() {
		if (this.scene.selected) {
			this.dom.querySelector("#object-pane").classList.add("active");

			// object pane code here
			this.dom.querySelector(".update-object-trigger").setAttribute("data-trigger-id", this.scene.selected.id);
			this.dom.querySelector("#object-pane-name").value = this.scene.selected.name;
			this.dom.querySelector("#object-pane-pos-x").value = this.scene.selected.position.x;
			this.dom.querySelector("#object-pane-pos-y").value = this.scene.selected.position.y;
			this.dom.querySelector("#object-pane-pos-z").value = this.scene.selected.position.z;
			// scale
			this.dom.querySelector("#object-pane-scale-x").value = this.scene.selected.scale.x;
			this.dom.querySelector("#object-pane-scale-y").value = this.scene.selected.scale.y;
			this.dom.querySelector("#object-pane-scale-z").value = this.scene.selected.scale.z;
			// rotation
			this.dom.querySelector("#object-pane-rotation-x").value = parseInt(etc.math.degrees(this.scene.selected.rotation.x), 10);
			this.dom.querySelector("#object-pane-rotation-y").value = parseInt(etc.math.degrees(this.scene.selected.rotation.y), 10);
			this.dom.querySelector("#object-pane-rotation-z").value = parseInt(etc.math.degrees(this.scene.selected.rotation.z), 10);
			this.dom.querySelector("#object-pane-color").value = "#" + this.scene.selected.material.color.getHexString();
		} else {
			this.dom.querySelector("#object-pane").classList.remove("active");
		}
	}
}
