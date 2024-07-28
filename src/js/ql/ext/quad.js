export default class Quad {
	constructor(a, b, c, d) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
	}

	clone() {
		return new Quad(this.a, this.b, this.c, this.d);
	}
}
