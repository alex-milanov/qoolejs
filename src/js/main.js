
var _views = {
	"tl": {
		"canvas": $(".canvas-tl")[0],
		"perspective": "top" // x, z
	},
	"tr": {
		"canvas": $(".canvas-tr")[0],
		"perspective": "3d"
	},
	"bl": {
		"canvas": $(".canvas-bl")[0],
		"perspective": "front" // x, y
	},
	"br": {
		"canvas": $(".canvas-br")[0],
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
		type: "block",
		start: [-200,-5,-100],
		finish: [200,0,100]
	},
	{ // left wall
		type: "block",
		start: [-100,0,-100],
		finish: [-95,70,50]
	},
	{ // left wall front
		type: "block",
		start: [-95,0,50],
		finish: [-170,70,55]
	},
	{ // right wall
		type: "block",
		start: [95,0,-100],
		finish: [100,70,50]
	},
	{ // right wall front
		type: "block",
		start: [95,0,50],
		finish: [170,70,55]
	},
	{ // back wall
		type: "block",
		start: [-95,0,-95],
		finish: [95,70,-100]
	}
]

var tlView = new QLView2D(_views.tl);
var blView = new QLView2D(_views.bl);
var brView = new QLView2D(_views.br);


var trView = new QLView3D(_views.tr);
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