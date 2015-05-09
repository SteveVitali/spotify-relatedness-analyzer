var Graph = React.createClass({
  getDefaultProps: function() {
    return {
      graph: {},
      id: 'graph',
      style:{
        width: '100%',
        height: '700px'
      }
    };
  },

  render: function() {
    console.log('graph graph', this.props.graph);
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

  componentDidUpdate: function() {
    this.updateGraph();
  },

  updateGraph: function() {
    var container = document.getElementById(this.props.id);
    var options = {};
    var network = new vis.Network(container, this.props.graph, options);
  }
});
