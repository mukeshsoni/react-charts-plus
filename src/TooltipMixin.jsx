let React = require('react');
let ReactDOM = require('react-dom');
let d3 = require('d3');

let TooltipMixin = {
  propTypes: {
    tooltipHtml: React.PropTypes.func,
    tooltipMode: React.PropTypes.oneOf(['mouse', 'element', 'fixed']),
    tooltipContained: React.PropTypes.bool,
    tooltipOffset: React.PropTypes.objectOf(React.PropTypes.number)
  },

  getInitialState() {
    return {
      tooltip: {
        hidden: true
      }
    };
  },

  getDefaultProps() {
    return {
      tooltipMode: 'mouse',
      tooltipOffset: {top: -20, left: 15},
      tooltipHtml: null,
      tooltipContained: false
    };
  },

  componentDidMount() {
    this._svg_node = ReactDOM.findDOMNode(this).getElementsByTagName("svg")[0];
  },

  onMouseEnter(e, data) {
    if (!this.props.tooltipHtml) {
      return;
    }

    e.preventDefault();

    let {margin,
       tooltipHtml,
       tooltipMode,
       tooltipOffset,
       tooltipContained} = this.props;

    let svg = this._svg_node;
    let position;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = e.clientX, point.y = e.clientY;
      point = point.matrixTransform(svg.getScreenCTM().inverse());
      position = [point.x - margin.left, point.y - margin.top];
    } else {
      let rect = svg.getBoundingClientRect();
      position = [e.clientX - rect.left - svg.clientLeft - margin.left,
            e.clientY - rect.top - svg.clientTop - margin.top];
    }

    let [html, xPos, yPos] = this._tooltipHtml(data, position);
    let svgTop = svg.getBoundingClientRect().top + margin.top;
        let svgLeft = svg.getBoundingClientRect().left + margin.left;
        let top = 0;
        let left = 0;

        if (tooltipMode === 'fixed') {
            top = svgTop + tooltipOffset.top;
            left = svgLeft + tooltipOffset.left;
        } else if (tooltipMode === 'element') {
            top = svgTop + yPos + tooltipOffset.top;
            left = svgLeft + xPos + tooltipOffset.left;
        } else { // mouse
            top = e.clientY + tooltipOffset.top;
            left = e.clientX + tooltipOffset.left;
        }

        function lerp(t, a, b) {
            return (1 - t) * a + t * b;
        }

        let translate = 0;
        if (tooltipContained) {
      let t = position[0] / svg.getBoundingClientRect().width;
      translate = lerp(t, 0, 100);
        }

    var newTooltip = {
      top: top,
      left: left,
      hidden: false,
      position: ['top', 'left'],
      html: html,
      translate: translate
    };

    if(window.innerWidth - e.clientX < 210) {
      newTooltip.position[1] = 'right';
      newTooltip.right = window.innerWidth - e.clientX + this.props.tooltipOffset.left;
    }

    if(window.innerHeight - e.clientY < 150) {
      newTooltip.position[0] = 'bottom';
      newTooltip.bottom = window.innerHeight - e.clientY + this.props.tooltipOffset.top;
    }

    this.setState({
      tooltip: newTooltip
    });
  },

  onMouseLeave(e) {
    if (!this.props.tooltipHtml) {
      return;
    }

    e.preventDefault();

    this.setState({
      tooltip: {
        hidden: true
      }
    });
  }
};

module.exports = TooltipMixin;
