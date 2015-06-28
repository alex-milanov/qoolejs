
var _views = {
	"tl": {
		"canvas": ".canvas-tl",
		"perspective": "top" // x, z
	},
	"tr": {
		"canvas": ".canvas-tr",
		"perspective": "3d"
	},
	"bl": {
		"canvas": ".canvas-bl",
		"perspective": "front" // x, y
	},
	"br": {
		"canvas": ".canvas-br",
		"perspective": "side" // z, y
	}
}




var _entities = [
	/*{
		type: "cube",
		position: [25,25,25],  // x, y, z
		size: 50
	},*/
	{ // ground
		name: "ground",
		type: "block",
		start: [-200,0,-100],
		finish: [200,5,100],
		color: 0x113311
	},
	{ // left wall
		name: "left wall",
		type: "block",
		start: [-100,5,-100],
		finish: [-95,70,50],
		color: 0x111122
	},
	{ // left wall front
		name: "left wall front",
		type: "block",
		start: [-95,5,50],
		finish: [-170,70,55],
		color: 0x111122
	},
	{ // right wall
		name: "right wall",
		type: "block",
		start: [95,5,-100],
		finish: [100,70,50],
		color: 0x111122
	},
	{ // right wall front
		name: "right wall front",
		type: "block",
		start: [95,5,50],
		finish: [170,70,55],
		color: 0x111122
	},
	{ // back wall
		name: "back wall",
		type: "block",
		start: [-95,5,-95],
		finish: [95,70,-100],
		color: 0x111122
	},
	{ // left wall segment
		name: "left wall segment",
		type: "block",
		start: [-105,70,-105],
		finish: [-100,80,50],
		color: 0x221111
	},
	{ // left wall front segment
		name: "left wall front segment",
		type: "block",
		start: [-105,70,45],
		finish: [-170,80,50],
		color: 0x221111
	},
	{ // right wall segment
		name: "right wall segment",
		type: "block",
		start: [100,70,-105],
		finish: [105,80,50],
		color: 0x221111
	},
	{ // right wall front segment
		name: "right wall front segment",
		type: "block",
		start: [105,70,45],
		finish: [170,80,50],
		color: 0x221111
	},
	{ // back wall segment
		name: "back wall segment",
		type: "block",
		start: [-100,70,-100],
		finish: [100,80,-105],
		color: 0x221111
	},
	{ // left wall top
		name: "left wall top",
		type: "block",
		start: [-100,80,-100],
		finish: [-95,100,50],
		color: 0xaaaa55
	},
	{ // left wall front top
		name: "left wall front top",
		type: "block",
		start: [-95,80,50],
		finish: [-170,100,55],
		color: 0xaaaa55
	},
	{ // right wall top
		name: "right wall top",
		type: "block",
		start: [95,80,-100],
		finish: [100,100,50],
		color: 0xaaaa55
	},
	{ // right wall front top
		name: "right wall front top",
		type: "block",
		start: [95,80,50],
		finish: [170,100,55],
		color: 0xaaaa55
	},
	{ // back wall top
		name: "back wall top",
		type: "block",
		start: [-95,80,-95],
		finish: [95,100,-100],
		color: 0xaaaa55
	}
]


var editor = new QL.gui.Editor(_views,_entities);
editor.init();

/*
var tlView = new QL.gui.View2D(_views.tl);
var blView = new QL.gui.View2D(_views.bl);
var brView = new QL.gui.View2D(_views.br);


var trView = new QL.gui.View3D(_views.tr);
trView.addEntities(_entities);

function refresh2dViews(){
	tlView.draw(_entities);
	blView.draw(_entities);
	brView.draw(_entities);
}

refresh2dViews();
trView.animate();

$(window).resize(function(){
	refresh2dViews();
});
*/