let React = require('react');
let d3 = require('d3');

let Tooltip = React.createClass({
	propTypes: {
		top: React.PropTypes.number.isRequired,
		left: React.PropTypes.number.isRequired,
		html: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.element
	    ]),
	},

	getDefaultProps() {
		return {
			top: 150,
			left: 100,
			html: ''
		};
	},

	render() {
		let {top, left, hidden, html, position, right} = this.props;

		let style = {
			display: hidden ? 'none' : 'block',
			position: 'fixed',
			top: 'inherit'
		};

		if(position) {
			style[position[0]] = this.props[position[0]];
			style[position[1]] = this.props[position[1]];
		} else {
			style.top = top;
			style.left = left;
		}

		return (
				<div className='tooltip' style={style}>{html}</div>
		);
	}
});

module.exports = Tooltip;
