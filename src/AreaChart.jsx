let React = require('react');
let d3 = require('d3');

let Chart = require('./Chart');
let Axis = require('./Axis');
let Path = require('./Path');
let Tooltip = require('./Tooltip');

let DefaultPropsMixin = require('./DefaultPropsMixin');
let HeightWidthMixin = require('./HeightWidthMixin');
let ArrayifyMixin = require('./ArrayifyMixin');
let StackAccessorMixin = require('./StackAccessorMixin');
let StackDataMixin = require('./StackDataMixin');
let DefaultScalesMixin = require('./DefaultScalesMixin');
let TooltipMixin = require('./TooltipMixin');

let DataSet = React.createClass({
	propTypes: {
		data: React.PropTypes.array.isRequired,
		area: React.PropTypes.func.isRequired,
		line: React.PropTypes.func.isRequired,
		colorScale: React.PropTypes.func.isRequired,
		stroke: React.PropTypes.func.isRequired
	},
	getDefaultProps: function() {
		return {
			showTooltip: true
		}
	},
	render() {
		let {data,
			 width,
			 height,
			 area,
			 line,
			 colorScale,
			 stroke,
			 lineStrokeWidth,
			 values,
			 showTooltip,
			 label,
			 onMouseEnter,
			 onMouseLeave} = this.props;

		let areas = data.map((stack, index) => {
			return (
					<Path
				key={`${label(stack)}.${index}`}
				className="area"
				stroke="none"
				fill={colorScale(label(stack), index)}
				d={area(values(stack))}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				data={data}
					/>
			);
		});

		let lines = data.map((stack, index) => {
			return (
					<Path
				key={`${label(stack)}.${index}`}
				className="line"
				d={line(values(stack))}
				stroke={stroke(label(stack), index)}
				strokeWidth={lineStrokeWidth}
					/>
			);
		});

		return (
				<g>
				{areas}
				{lines}
				<rect 
					width={width} 
					height={height} 
					fill={'none'} 
					stroke={'none'} 
					style={{pointerEvents: showTooltip ? 'all' : 'none'}}
					onMouseMove={ evt => { onMouseEnter(evt, data); } }
					onMouseLeave={  evt => { onMouseLeave(evt); } }
				/>
			</g>
		);
	}
});

let AreaChart = React.createClass({
	mixins: [DefaultPropsMixin,
			 HeightWidthMixin,
			 ArrayifyMixin,
			 StackAccessorMixin,
			 StackDataMixin,
			 DefaultScalesMixin,
			 TooltipMixin],

	propTypes: {
		interpolate: React.PropTypes.string,
		stroke: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			interpolate: 'linear',
			stroke: d3.scale.category20(),
			lineStrokeWidth: 2
		};
	},

	_tooltipHtml(d, position) {
		let {x, y0, y, values, label} = this.props;
		let [xScale, yScale] = [this._xScale, this._yScale];

		let xValueCursor = xScale.invert(position[0]);

		let xBisector = d3.bisector(e => { return x(e); }).right;
		let xIndex = xBisector(values(d[0]), xScale.invert(position[0]));
		xIndex = (xIndex == values(d[0]).length) ? xIndex - 1: xIndex;

		let xIndexRight = xIndex == values(d[0]).length ? xIndex - 1: xIndex;
		let xValueRight = x(values(d[0])[xIndexRight]);

		let xIndexLeft = xIndex == 0 ? xIndex : xIndex - 1;
		let xValueLeft = x(values(d[0])[xIndexLeft]);

		if (Math.abs(xValueCursor - xValueRight) < Math.abs(xValueCursor - xValueLeft)) {
			xIndex = xIndexRight;
		} else {
			xIndex = xIndexLeft;
		}

		let yValueCursor = yScale.invert(position[1]);

		let yBisector = d3.bisector(e => { return y0(values(e)[xIndex]) + y(values(e)[xIndex]); }).left;
		let yIndex = yBisector(d, yValueCursor);
		yIndex = (yIndex == d.length) ? yIndex - 1: yIndex;

		let yValue = y(values(d[yIndex])[xIndex]);
		let yValueCumulative = y0(values(d[d.length - 1])[xIndex]) + y(values(d[d.length - 1])[xIndex]);

		return this.props.tooltipHtml(yValue, yValueCumulative, xIndex);
	},

	render() {
		let {height,
			 width,
			 margin,
			 colorScale,
			 interpolate,
			 stroke,
			 lineStrokeWidth,
			 offset,
			 values,
			 showTooltip,
			 label,
			 x,
			 y,
			 y0,
			 xAxis,
			 yAxis} = this.props;

		let [data,
			 innerWidth,
			 innerHeight,
			 xScale,
			 yScale,
			 xIntercept,
			 yIntercept] = [this._data,
							this._innerWidth,
							this._innerHeight,
							this._xScale,
							this._yScale,
							this._xIntercept,
							this._yIntercept];

		let line = d3.svg.line()
				.x(function(e) { return xScale(x(e)); })
				.y(function(e) { return yScale(y0(e) + y(e)); })
				.interpolate(interpolate);

		let area = d3.svg.area()
				.x(function(e) { return xScale(x(e)); })
				.y0(function(e) { return yScale(yScale.domain()[0] + y0(e)); })
				.y1(function(e) { return yScale(y0(e) + y(e)); })
				.interpolate(interpolate);

		return (
			<div>
				<Chart 
					height={height} 
					width={width} 
					margin={margin}>

				<DataSet
					height={innerHeight}
					width={innerWidth}
					data={data}
					line={line}
					area={area}
					colorScale={colorScale}
					stroke={stroke}
					lineStrokeWidth={lineStrokeWidth}
					label={label}
					values={values}
					showTooltip={showTooltip}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				/>

				<Axis
			className={"x axis"}
			orientation={"bottom"}
			scale={xScale}
			height={innerHeight}
			width={innerWidth}
			{...xAxis}
				/>

				<Axis
			className={"y axis"}
			orientation={"left"}
			scale={yScale}
			height={innerHeight}
			width={innerWidth}
			{...yAxis}
				/>
				</Chart>

				<Tooltip
					ref='tooltip'
					hidden={this.state.tooltip.hidden}
					top={this.state.tooltip.top}
					position={this.state.tooltip.position}
					left={this.state.tooltip.left}
					right={this.state.tooltip.right}
					bottom={this.state.tooltip.bottom}
					html={this.state.tooltip.html} />
				</div>
		);
	}
});

module.exports = AreaChart;
