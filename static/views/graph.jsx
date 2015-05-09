var Graph = React.createClass({
  getDefaultProps: function() {
    return {
      graph: {},
      id: 'graph',
      style:{
        width: '640px',
        height: '480px'
      }
    };
  },

  render: function() {
    return React.createElement(
      'div', {
        className: 'container',
        id: this.props.id,
        style: this.props.style
      }, this.props.id
    );
  },

  componentDidMount: function() {
    this.updateGraph();
  },

  updateGraph: function() {
    var container = document.getElementById(this.props.id);
    var options = {};
    var network = new vis.Network(container, this.props.graph, options);
  }
});
