import Vector2 from '../gfx/vector2';
import Canvas from './canvas';

export default class Grid extends Canvas {

	refresh() {
		super.refresh();

		const ctx = this.ctx;

		const center = new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2);
		const sizeVector = new Vector2(ctx.canvas.width, ctx.canvas.height);

		center.add(this.offset);

		this.line([0, center.y], [sizeVector.x, center.y], '#96DC96');

		this.line([center.x, 0], [center.x, sizeVector.y], '#96DC96');

		let step = 10;
		step *= this.zoom / 100;

		const defaultLineColor = '#333';
		const segmentColor = '#555';

		for (let yPos = step; center.y - yPos > 0; yPos += step) {
			let lineColor = (Math.floor(yPos / step / 5) === yPos / step / 5) ? segmentColor : defaultLineColor;
			this.line([0, center.y - yPos], [sizeVector.x, center.y - yPos], lineColor);
		}

		for (let yPos = step; center.y + yPos < sizeVector.y; yPos += step) {
			let lineColor = (Math.floor(yPos / step / 5) === yPos / step / 5) ? segmentColor : defaultLineColor;
			this.line([0, center.y + yPos], [sizeVector.x, center.y + yPos], lineColor);
		}

		for (let xPos = step; center.x - xPos > 0; xPos += step) {
			let lineColor = (Math.floor(xPos / step / 5) === xPos / step / 5) ? segmentColor : defaultLineColor;
			this.line([center.x - xPos, 0], [center.x - xPos, sizeVector.y], lineColor);
		}

		for (let xPos = step; center.x + xPos < sizeVector.x; xPos += step) {
			let lineColor = (Math.floor(xPos / step / 5) === xPos / step / 5) ? segmentColor : defaultLineColor;
			this.line([center.x + xPos, 0], [center.x + xPos, sizeVector.y], lineColor);
		}
	}
}
