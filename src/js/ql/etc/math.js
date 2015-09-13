"use strict";

if(typeof QL === "undefined"){ var QL = {}; }
if(typeof QL.etc === "undefined"){ QL.etc = {}; }

QL.etc.Math = {};

QL.etc.Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
QL.etc.Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};