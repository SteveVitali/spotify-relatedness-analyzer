function Graph() {
  // Map vertex id's to vertex data
  // e.g. this.nodes[id] = {
  //   edges: {
  //     <toId>: <edge data>,
  //     ...
  //   },
  //   <other data>,
  //   ...
  // }
  this.nodes = {};
}

Graph.prototype = {
  addNode: function(id, data) {
    this.nodes[id] = _.extend(data || {}, { edges: {} });
  },

  addEdge: function(fromId, toId, data) {
    if (!this.nodes[fromId]) {
      throw 'Error: no edge with id ' + fromId;
    }
    this.nodes[fromId].edges[toId] = data || {};
  },

  getNeighbors: function(nodeId) {
    if (!this.nodes[nodeId]) {
      throw 'Error: no edge with id ' + nodeId;
    }
    return this.nodes[nodeId].edges;
  },

  // Get weakly connected components of 
  // minimum size k
  getWeaklyConnectedComponents: function(k) {
    var lowerLimit = k || 1;
    var components = [];
    var stack = [];
    var discovered = {};
    for (var id in this.nodes) {
      var component = [];
      stack.unshift(id);

      while (stack.length > 0) {
        var nodeId = stack.shift();
        if (!(nodeId in discovered)) {
          discovered[nodeId] = true;
          component.push(nodeId);
          for (var neighborId in this.getNeighbors(nodeId)) {
            stack.unshift(neighborId);
          }
        }
      }
      if (component.length >= lowerLimit) {
        components.push(component);
      }
    }
    console.log('components', components);
    return components;
  },

  // Get the graph in a representation compatible w/ vis
  getVisGraph: function() {
    var visNodes = [];
    var visEdges = [];

    var idCnt = 0;
    var idMap = {};
    var getId = function(id) {
      return (id in idMap) 
        ? idMap[id] 
        : (idMap[id] = idCnt++);
    }

    // We store an edgeMap to make sure we don't include 
    // duplicate edges, since the vis graph is undirected
    var edgeMap = {};
    var hashEdge = function(from, to) {
      return to < from 
        ? to + '+' + from
        : from + '+' + to;
    };

    for (var id in this.nodes) {
      var node = this.nodes[id];
      var nodeData = _.clone(_.omit(node, 'edges'));
      var visNode = _.extend(nodeData, { 
        id: getId(id) 
      });
      visNodes.push(visNode);

      for (var toId in node.edges) {
        var edgeHash = hashEdge(id, toId);
        if (!(edgeHash in edgeMap)) {
          var edgeData = _.clone(node.edges[toId]);
          visEdges.push(_.extend(edgeData, {
            from: getId(id),
            to: getId(toId)
          }));
          edgeMap[edgeHash] = true;
        }
      }
    }
    return {
      nodes: visNodes,
      edges: visEdges
    };
  }
};
