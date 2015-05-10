function Graph() {
  // Map vertex id's to vertex data
  this.nodes = {};
  // Map 'edge hash' to edge data
  this.edges = {};
}

Graph.prototype = {
  addNode: function(id, data) {
    this.nodes[id] = data;
  },

  addEdge: function(fromId, toId, data) {
    var hash = this.hashEdge(fromId, toId);
    this.edges[hash] = _.extend(data || {}, {
      from: fromId,
      to: toId
    });;
  },

  hashEdge: function(from, to) {
    return to < from 
      ? to + '+' + from
      : from + '+' + to;
  },

  // Get the graph in a representation compatible w/ vis
  getVisGraph: function() {
    var visNodes = [];
    var visEdges = [];
    var idCnt = 0;
    var idMap = {};
    var getId = function(id) {
      if (!(id in idMap)) {
        idMap[id] = idCnt++;
      }
      return idMap[id];
    }
    for (var id in this.nodes) {
      var visNode = _.extend(_.clone(this.nodes[id]), { 
        id: getId(id) 
      });
      visNodes.push(visNode);
    }
    for (var edgeHash in this.edges) {
      var edge = _.clone(this.edges[edgeHash]);
      var visEdge = _.extend(edge, {
        from: getId(edge.from),
        to: getId(edge.to)
      });
      visEdges.push(visEdge);
    }
    return {
      nodes: visNodes,
      edges: visEdges
    };
  }
};
