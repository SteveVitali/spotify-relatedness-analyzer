var SongSort = React.createClass({
  getInitialState: function() {
    return {
      isAuthorized: Spotify.getAccessToken(),
      artistsMap: {},
      graph: {},
      count: 0
    };
  },

  getDefaultProps: function() {
    return {
    };
  },

  fetchTracks: function() {
    var that = this;
    Spotify.fetchCurrentUserProfile(function(user) {
      if (user) {
        Spotify.fetchSavedTracks(function(data) {
          if (data) {
            that.processTracks(data);
          } else {
            console.log('Error: no data');
          }
        });
      } else {
        console.log('Error: could not log in');
      }
    });
  },

  processTracks: function(trackData) {
    var artistsMap = this.state.artistsMap;

    var that = this;
    _.each(trackData.items, function(item) {
      var track = item.track;

      _.each(track.artists, function(artist) {
        if (!(artist.id in artistsMap)) {
          artistsMap[artist.id] = {
            name: artist.name,
            tracksMap: {},
            relatedMap: {}
          };
        }
        artistsMap[artist.id].tracksMap[track.id] = {
          name: track.name
        };
      });
    });

    that.setState({ 
      artistsMap: artistsMap,
      count: this.state.count + 1
    });

    if (trackData.next /*&& this.state.count < 2*/) {
      Spotify.callSpotify(trackData.next, {}, this.processTracks);
    } else {
      this.populateRelatedArtists(function() {
        that.constructGraph();
      });
    }
  },

  constructGraph: function() {
    var idCnt = 0;
    var idMap = {};
    var getId = function(id) {
      if (!(id in idMap)) {
        idMap[id] = ++idCnt;
      }
      return idMap[id];
    }
    var edgeHashes = {};
    var getHash = function(from, to) {
      return to < from 
        ? to + '+' + from
        : from + '+' + to;
    }

    var nodes = [];
    var edges = [];

    for (var artistId in this.state.artistsMap) {
      var artist = this.state.artistsMap[artistId];

      nodes.push({
        id: getId(artistId),
        label: artist.name
      });
      for (var relatedId in artist.relatedMap) {
        var edgeHash = getHash(relatedId, artistId);
        if (!(edgeHash in edgeHashes)) {
          edges.push({
            from: getId(artistId),
            to: getId(relatedId)
          });
          edgeHashes[edgeHash] = true;
        }
      }
    }
    this.setState({
      graph: {
        nodes: nodes,
        edges: edges
      }
    });
  },

  populateRelatedArtists: function(callback) {
    var that = this;
    var count = 0;
    var artistIds = _.keys(this.state.artistsMap);
    var artistsMap = this.state.artistsMap;

    _.each(artistIds, function(artistId) {
      Spotify.fetchRelatedArtists(artistId, function(relateds) {
        _.each(relateds.artists, function(related) {
          if (related.id in that.state.artistsMap) {
            artistsMap[artistId].relatedMap[related.id] = {
              name: related.name
            };
            artistsMap[related.id].relatedMap[artistId] = {
              name: artistsMap[artistId].name
            };
          }
        });
        if (++count == artistIds.length) {
          callback();
        }
      });
    });
    this.setState({
      artistsMap: artistsMap
    });
  },

  render: function() {
    var actionButton = (
      <button className='btn btn-default btn-lg' 
        onClick={this.state.isAuthorized 
          ? this.fetchTracks 
          : Spotify.authorizeUser}>
        {this.state.isAuthorized 
          ? 'Fetch Songs' 
          : 'Login to Spotify'}
      </button>
    );

    return (
      <div>
        {actionButton}
        <Graph graph={this.state.graph} />
      </div>
    );
  }
});
