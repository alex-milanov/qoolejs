// degrees to radians
export const radians = degrees => degrees * Math.PI / 180;

// Converts from radians to degrees.
export const degrees = radians => radians * 180 / Math.PI;

export default {
	radians,
	degrees
};
