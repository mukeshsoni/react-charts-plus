let React = require('react');
let d3 = require('d3');

let Path = React.createClass({
	propTypes: {
		className: React.PropTypes.string,
		stroke: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
			React.PropTypes.object
	    ]),
		strokeLinecap: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
	    ]),
		strokeWidth: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
	    ]),
		strokeDasharray: React.PropTypes.string,
		fill: React.PropTypes.string,
		d: React.PropTypes.string.isRequired,
		data: React.PropTypes.array
	},

	getDefaultProps() {
		return {
			className: 'path',
			fill: 'none',
			strokeWidth: '2',
			strokeLinecap: 'butt',
			strokeDasharray: 'none'
		};
	},

	render() {
		let {className,
			 stroke,
			 strokeWidth,
			 strokeLinecap,
			 strokeDasharray,
			 fill,
			 d,
			 style,
			 data,
			 onMouseEnter,
			 onMouseLeave} = this.props;

		return (
				<path
			className={className}
			stroke={stroke}
			strokeWidth={strokeWidth}
			strokeLinecap={strokeLinecap}
			strokeDasharray={strokeDasharray}
			fill={fill}
			d={d}
			onMouseMove={ evt => { onMouseEnter(evt, data); } }
			onMouseLeave={  evt => { onMouseLeave(evt); } }
			style={style}
				/>
		);
	}
});

module.exports = Path;
