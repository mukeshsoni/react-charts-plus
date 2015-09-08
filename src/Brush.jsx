let React = require('react');
let d3 = require('d3');

let Chart = require('./Chart');
let Axis = require('./Axis');

let HeightWidthMixin = require('./HeightWidthMixin');

function mergeObjects(obj1, obj2) {
	for (var attrname in obj2) { 
		obj1[attrname] = obj2[attrname]; 
	}

	return obj1;
}

// Adapted for React from https://github.com/mbostock/d3/blob/master/src/svg/brush.js
// TODO: Add D3 License
let _d3_svg_brushCursor = {
	n: 'ns-resize',
	e: 'ew-resize',
	s: 'ns-resize',
	w: 'ew-resize',
	nw: 'nwse-resize',
	ne: 'nesw-resize',
	se: 'nwse-resize',
	sw: 'nesw-resize'
};

let _d3_svg_brushResizes = [
	['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw'],
	['e', 'w'],
	['n', 's'],
	[]
];

function getResizerElement(e, width, height, style, isEmpty, xExtent, yExtent, onMouseDown) {
	let extentSelectorStyle = { cursor: _d3_svg_brushCursor[e] };

	return (
		<g
			key={e}
			className={`resize ${e}`}
			style={mergeObjects(extentSelectorStyle, style)}
			transform={`translate(${xExtent[+/e$/.test(e)]}, ${yExtent[+/^s/.test(e)]})`}
			onMouseDown={(event) => { onMouseDown(event, e); }}>
			<rect
				x={/[ew]$/.test(e) ? -3 : null}
				y={/^[ns]/.test(e) ? -3 : null}
				width={width}
				height={height}
				style={{ display: isEmpty ? 'none' : null }}
			/>
		</g>
	);
}

function getBackgroundElement(style, xRange, yRange, height, onMouseDown) {
	let backgroundStyle = { visibility: 'visible', cursor: 'crosshair' };

	return (
		<rect
			className='background'
			style={mergeObjects(backgroundStyle, style)}
			x={xRange ? xRange[0] : ''}
			width={xRange ? xRange[1] - xRange[0] : ''}
			y={yRange ? yRange[0] : ''}
			height={yRange ? yRange[1] - yRange[0] : height}
			onMouseDown={onMouseDown}
		/>
	);
}

function getExtentElement(style, xExtent, height, onMouseDown) {
	let extentStyle = {cursor: 'move'};

	return (
		<rect
			className="extent"
			style={mergeObjects(extentStyle, style)}
			x={xExtent[0]}
			width={xExtent[1] - xExtent[0]}
			height={height}
			onMouseDown={onMouseDown}
		/>
	);
}

// TODO: add y axis support
let Brush = React.createClass({
	mixins: [HeightWidthMixin],
	propTypes: {
		extent: React.PropTypes.array.isRequired,
		xAxis: React.PropTypes.object,
		// The extent, i.e. the selected period, is initialized by the parent but is later fully controlled by Brush component
		// But there might be scenarios when the parent wants to reset the extent to some value (keeping the scale same)
		resetExtent: React.PropTypes.bool,

		backgroundStyle: React.PropTypes.object,
		extentStyle: React.PropTypes.object,
		extentSelectorStyle: React.PropTypes.object,

		getResizerElement: React.PropTypes.func,
		getBackgroundElement: React.PropTypes.func,
		getExtentElement: React.PropTypes.func,

		/**
		 * to lock one of the ends of the extent selector
		 */
		lockExtent: React.PropTypes.string
	},
	getInitialState() {
		return {
			resizers:  _d3_svg_brushResizes[0],
			xExtent: [0, 0],
			yExtent: [0, 0],
			xExtentDomain: undefined,
			yExtentDomain: undefined
		};
	},

	getDefaultProps() {
		return {
			xScale: null,
			yScale: null,
			getResizerElement: getResizerElement,
			getBackgroundElement: getBackgroundElement,
			getExtentElement: getExtentElement
		};
	},

	componentWillMount() {
		this._extent(this.props.extent);
		this.setState({
			resizers: _d3_svg_brushResizes[!(this.props.xScale) << 1 | !(this.props.yScale)]
		});

		document.addEventListener('mouseup', this._onMouseUp);
		// document.addEventListener('mouseout', this._onMouseUp);
		document.addEventListener('mousemove', this._onMouseMove);
	},

	componentWillUnmount() {
		document.removeEventListener('mouseup', this._onMouseUp);
		// document.removeEventListener('mouseout', this._onMouseUp);
		document.removeEventListener('mousemove', this._onMouseMove);
	},

	componentWillReceiveProps(nextProps) {
		// when <Brush/> is used inside a component
		// we should not set the extent prop on every redraw of the parent, because it will
		// stop us from actually setting the extent with the brush.
		if (nextProps.xScale !== this.props.xScale || nextProps.resetExtent === true) {
			this._extent(nextProps.extent, nextProps.xScale);
			this.setState({
				resizers: _d3_svg_brushResizes[!(this.props.xScale) << 1 | !(this.props.yScale)]
			});
		}
	},

	render() {
		// TODO: remove this.state this.props
		let xRange = this.props.xScale ? this._d3_scaleRange(this.props.xScale) : null;
		let yRange = this.props.yScale ? this._d3_scaleRange(this.props.yScale) : null;
		
		let background = this.props.getBackgroundElement(
										this.props.backgroundStyle, 
										xRange, 
										yRange, 
										this._innerHeight,
										this._onMouseDownBackground);

		// TODO: it seems like actually we can have both x and y scales at the same time. need to find example.

		let extent;

		if (this.props.xScale) {
			extent = this.props.getExtentElement(
									this.props.extentStyle,
									this.state.xExtent,
									this._innerHeight,
									this._onMouseDownExtent);
		}

		let resizers = this.state.resizers
								.filter((e) => {
									if(this.props.lockExtent === 'right' && e === 'e' || this.props.lockExtent === 'left' && e === 'w') {
										return false;
									}
									return true;
								})
								.map((e) => {
									// (e, width, height, style, isEmpty, xExtent, yExtent, onMouseDown)
									return this.props.getResizerElement(e, 10, this._innerHeight, this.props.extentSelectorStyle, 
																	this._empty(), this.state.xExtent, this.state.yExtent, this._onMouseDownResizer);
								});

			// onMouseUp={this._onMouseUp}
			// onMouseMove={this._onMouseMove}
		return (
				<div>
				<Chart height={this.props.height} width={this.props.width} margin={this.props.margin}>
				<g
			style={{ pointerEvents: 'all' }}
				>
				{background}{extent}{resizers}
			</g>

				<Axis
			className={"x axis"}
			orientation={"bottom"}
			scale={this.props.xScale}
			height={this._innerHeight}
			width={this._innerWidth}
			{...this.props.xAxis}
				/>
				</Chart>
				</div>
		);
	},

	// TODO: Code duplicated in TooltipMixin.jsx, move outside.
	_getMousePosition(e) {
		let svg = this.getDOMNode().getElementsByTagName('svg')[0];
		let position;
		if (svg.createSVGPoint) {
			var point = svg.createSVGPoint();
			point.x = e.clientX, point.y = e.clientY;
			point = point.matrixTransform(svg.getScreenCTM().inverse());
			position = [point.x - this.props.margin.left, point.y - this.props.margin.top];
		} else {
			let rect = svg.getBoundingClientRect();
			position = [e.clientX - rect.left - svg.clientLeft - this.props.margin.left,
						e.clientY - rect.top - svg.clientTop - this.props.margin.left];
		}

		return position;
	},

	_onMouseDownBackground(e) {
		e.preventDefault();
		let range = this._d3_scaleRange(this.props.xScale);
		let point = this._getMousePosition(e);

		let size = this.state.xExtent[1] - this.state.xExtent[0];

		range[1] -= size;

		let min = Math.max(range[0], Math.min(range[1], point[0]));
		this.setState({xExtent: [min, min + size]});
	},

	// TODO: use constants instead of strings
	_onMouseDownExtent(e) {
		e.preventDefault();
		this._mouseMode = 'drag';

		let point = this._getMousePosition(e);
		let distanceFromBorder = point[0] - this.state.xExtent[0];

		this._startPosition = distanceFromBorder;
	},

	_onMouseDownResizer(e, dir) {
		e.preventDefault();
		this._mouseMode = 'resize';
		this._resizeDir = dir;
	},

	callOnChangeCallback() {
		this.props.onChange(this._extent());
	},

	_onDrag(e) {
		let range = this._d3_scaleRange(this.props.xScale);
		let point = this._getMousePosition(e);

		let size = this.state.xExtent[1] - this.state.xExtent[0];

		range[1] -= size;

		let min = Math.max(range[0], Math.min(range[1], point[0] - this._startPosition));

		this.setState({xExtent: [min, min + size], xExtentDomain: null}, this.callOnChangeCallback);
	},

	_onResize(e) {
		let range = this._d3_scaleRange(this.props.xScale);
		let point = this._getMousePosition(e);
		// Don't let the extent go outside of its limits
		// TODO: support clamp argument of D3
		let min = Math.max(range[0], Math.min(range[1], point[0]));

		if (this._resizeDir == 'w') {
			if (min > this.state.xExtent[1]) {
				this.setState({xExtent: [this.state.xExtent[1], min], xExtentDomain: null}, this.callOnChangeCallback);
				this._resizeDir = 'e';
			} else {
				this.setState({xExtent: [min, this.state.xExtent[1]], xExtentDomain: null}, this.callOnChangeCallback);
			}
		} else if (this._resizeDir == 'e') {
			if (min < this.state.xExtent[0]) {
				this.setState({xExtent: [min, this.state.xExtent[0]], xExtentDomain: null}, this.callOnChangeCallback);
				this._resizeDir = 'w';
			} else {
				this.setState({xExtent: [this.state.xExtent[0], min], xExtentDomain: null}, this.callOnChangeCallback);
			}
		}
	},

	_onMouseMove(e) {
		if (this._mouseMode == 'resize') {
			e.preventDefault();
			this._onResize(e);
		} else if (this._mouseMode == 'drag') {
			e.preventDefault();
			this._onDrag(e);
		}
	},

	_onMouseUp(e) {
		if(this._mouseMode) {
			e.preventDefault();
			this._mouseMode = null;
			this.props.onChange(this._extent());
		}
	},

	_extent(z, xScale) {
		let [x, y] = [xScale || this.props.xScale, this.props.yScale];

		let {xExtent, yExtent, xExtentDomain, yExtentDomain} = this.state;

		var x0, x1, y0, y1, t;

		// Invert the pixel extent to data-space.
		if (!arguments.length) {
			if (x) {
				if (xExtentDomain) {
					x0 = xExtentDomain[0], x1 = xExtentDomain[1];
				} else {
					x0 = xExtent[0], x1 = xExtent[1];
					if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
					if (x1 < x0) t = x0, x0 = x1, x1 = t;
				}
			}
			if (y) {
				if (yExtentDomain) {
					y0 = yExtentDomain[0], y1 = yExtentDomain[1];
				} else {
					y0 = yExtent[0], y1 = yExtent[1];
					if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
					if (y1 < y0) t = y0, y0 = y1, y1 = t;
				}
			}
			return x && y ? [[x0, y0], [x1, y1]] : x ? [x0, x1] : y && [y0, y1];
		}

		// Scale the data-space extent to pixels.
		if (x) {
			x0 = z[0], x1 = z[1];
			if (y) x0 = x0[0], x1 = x1[0];
			xExtentDomain = [x0, x1];
			if (x.invert) x0 = x(x0), x1 = x(x1);
			if (x1 < x0) t = x0, x0 = x1, x1 = t;
			if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [x0, x1]; // copy-on-write
		}
		if (y) {
			y0 = z[0], y1 = z[1];
			if (x) y0 = y0[1], y1 = y1[1];
			yExtentDomain = [y0, y1];
			if (y.invert) y0 = y(y0), y1 = y(y1);
			if (y1 < y0) t = y0, y0 = y1, y1 = t;
			if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [y0, y1]; // copy-on-write
		}

		this.setState({ xExtent: xExtent, yExtent: yExtent, xExtentDomain: xExtentDomain, yExtentDomain: yExtentDomain });
	},

	_empty() {
		return !!this.props.xScale && this.state.xExtent[0] == this.state.xExtent[1]
			|| !!this.props.yScale && this.state.yExtent[0] == this.state.yExtent[1];
	},

	// TODO: Code duplicated in Axis.jsx, move outside.
	_d3_scaleExtent(domain) {
		let start = domain[0], stop = domain[domain.length - 1];
		return start < stop ? [start, stop] : [stop, start];
	},

	_d3_scaleRange(scale) {
		return scale.rangeExtent ? scale.rangeExtent() : this._d3_scaleExtent(scale.range());
	}
});

module.exports = Brush;
