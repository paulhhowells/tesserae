const svgNS = 'http://www.w3.org/2000/svg';

export default function initialise (window, document, element) {
	const tesseraWidth = 100;
	const tesseraHalfWidth = tesseraWidth / 2;
	const tesseraHeight = Math.round(tesseraWidth * 0.86);
	const colours = makeColours();

	const width = element.offsetWidth;
	const height = element.offsetHeight;
	const numberOfTesseraePointsX = Math.ceil(width / tesseraWidth) + 2;
	const numberOfTesseraePointsY = Math.ceil(height / tesseraHeight) + 2;
	const matrix = makePointMatrix(numberOfTesseraePointsX, numberOfTesseraePointsY, tesseraWidth, tesseraHalfWidth, tesseraHeight);
	const randomisedMatrix = randomiseMatrix(matrix, 10 + (Math.random() * 120));

	const svg = makeSVG(width, height, document);
	const triangleGroup = makeTriangleGroup(randomisedMatrix, colours);

	svg.appendChild(triangleGroup);
	element.appendChild(svg);

	window.addEventListener('resize', () => {
		window.requestAnimationFrame(() => {
			svg.setAttribute('width', element.offsetWidth);
			svg.setAttribute('height', element.offsetHeight);
		});
	});
}

function makeTriangleGroup (pointMatrix) {
	const group = document.createElementNS(svgNS,'g');

	group.setAttribute('shape-rendering', 'geometricPrecision');
	group.setAttribute('stroke', '#ffffff');
	group.setAttribute('stroke-width', 0.2 + (3 * Math.random()));

	for (let v = 0, vertical = pointMatrix.length - 1; v < vertical; v++) {
		const even = !(v % 2);
		const row = pointMatrix[v];

		for (let h = 0, horizontal = row.length - 1; h < horizontal; h++) {
			let
				ABC = null,
				DEF = null;

			if (even) {
				if (pointMatrix[v][h + 1] && pointMatrix[v + 1][h] && pointMatrix[v + 1][h]) {
					// O   oO     ~    A   BD
					//   oo   o   ~    CE   F
					ABC = [
						pointMatrix[v    ][h    ],
						pointMatrix[v    ][h + 1],
						pointMatrix[v + 1][h    ],
					];
					DEF = [
						pointMatrix[v    ][h + 1],
						pointMatrix[v + 1][h    ],
						pointMatrix[v + 1][h + 1],
					];
				}
			} else {
				if (pointMatrix[v + 1][h] && pointMatrix[v + 1][h + 1] && pointMatrix[v][h + 1]) {
					//   OO   o   ~    AD   E
					// o   oo     ~    B   CF
					ABC = [
						pointMatrix[v    ][h    ],
						pointMatrix[v + 1][h    ],
						pointMatrix[v + 1][h + 1],
					];
					DEF = [
						pointMatrix[v    ][h    ],
						pointMatrix[v    ][h + 1],
						pointMatrix[v + 1][h + 1],
					];
				}
			}

			if (ABC) {
				group.appendChild(makeTrianglePolygon(ABC, randomColour()));
			}

			if (DEF) {
				group.appendChild(makeTrianglePolygon(DEF, randomColour()));
			}
		}
	}

	return group;
}

function makeTrianglePolygon (points, colour) {
	const trianglePolygon = document.createElementNS(svgNS, 'polygon');

	trianglePolygon.setAttribute('points', makeTrianglePolygonPoints(points));
	trianglePolygon.setAttribute('fill', colour);

	return trianglePolygon;
}

function makeTrianglePolygonPoints ([A, B, C]) {
	return `${A[0]} ${A[1]}, ${B[0]} ${B[1]}, ${C[0]} ${C[1]}`;
}

function randomiseMatrix (matrix, variation = 10) {
	return matrix.map((row) => {
		return row.map((point) => {
			return point.map((coordinate) => {
				return coordinate + (Math.random() - 0.5) * variation;
			})
		})
	});
}

function makeColours () {
	const cicadaIncrement = 13;

	const numbers = [];
	numbers.length = 5;
	numbers.fill(null);

	const colours = [];
	colours.length = 37;

	return colours
		.fill(null)
		.map((value, index) => {
			const cicada = (index * (20 + cicadaIncrement));
			const hue = cicada % 360;
			const hsl = `hsl(${hue}, 70%, 70%)`;

			return hsl;
		});
}

const randomColour = (function () {
	const hueStart = Math.random() * 360;

	console.log('hueStart', hueStart);

	const hueRange = 40;
	const saturationStart = 70;
	const saturationRange = 30;
	const lightnessStart = 20;
	const lightnessRange = 40;

	return function () {
		const hue = Math.round((hueStart + (hueRange * Math.random())) % 360);
		const saturation = Math.min(100, Math.round(saturationStart + (saturationRange * Math.random())));
		const lightness = Math.min(100, Math.round(lightnessStart + (lightnessRange * Math.random())));

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}
}());

function makePointMatrix (numberOfTesseraePointsX, numberOfTesseraePointsY, tesseraWidth, tesseraHalfWidth, tesseraHeight) {
	const matrix = [];
	matrix.length = numberOfTesseraePointsY;

	// returns [
	//   [[x, y], [x, y], [x, y]],
	//   [[x, y], [x, y], [x, y]],
	// ]
	return matrix
		.fill(null)
		.map((value, index) => {
			const xStart = ((index % 2) * tesseraHalfWidth) - tesseraWidth; // Indent on odd indexes, and subtract tesseraWidth to avoid showing edge.
			const y = (index * tesseraHeight) - tesseraHeight;
			const numberOfPoints = numberOfTesseraePointsX;

			return makePointArray(xStart, y, numberOfPoints, tesseraWidth);
		});
}

function makePointArray (xStart = 0, y, numberOfPoints, tesseraWidth) {
	const points = [];
	points.length = numberOfPoints;

	// returns [[x, y], [x, y], [x, y]]
	return points
		.fill(null)
		.map(
			(value, index) => [xStart + (index * tesseraWidth), y]
		);
}

function makeSVG (width, height, document) {
	// <?xml version="1.0" encoding="UTF-8"?>
	const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	svgElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
	svgElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
	svgElement.setAttribute('version', '1.1');
	svgElement.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
	svgElement.setAttribute('width', width);
	svgElement.setAttribute('height', height);
	// svgElement.setAttribute('preserveAspectRatio', 'xMinYMin slice');

	return svgElement;
}
