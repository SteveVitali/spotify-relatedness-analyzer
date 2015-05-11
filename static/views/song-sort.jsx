var SongSort = React.createClass({
  getInitialState: function() {
    return {
      isAuthorized: Spotify.getAccessToken(),
      artistsMap: {},
      graph: {},
      count: 0,
      status: Spotify.getAccessToken() ? 'fetch' : 'login',
      tracksFetched: 0,
      tracksTotal: 0
    };
  },

  getDefaultProps: function() {
    return {};
  },

  fetchTracks: function() {
    var that = this;
    Spotify.fetchCurrentUserProfile(function(user) {
      if (user) {
        Spotify.fetchSavedTracks(function(data) {
          if (data) {
            that.processTracks(data, 0);
          } else {
            console.log('Error: no data');
          }
        });
      } else {
        console.log('Error: could not log in');
      }
    });
  },

  processTracks: function(trackData, count) {
    var SONG_LIMIT_FOR_TESTING = 20;

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
      tracksFetched: this.state.tracksFetched + trackData.items.length,
      tracksTotal: trackData.total || this.state.tracksTotal,
      status: 'fetching'
    });

    if (trackData.next && count < 500) {
      Spotify.callSpotify(trackData.next, {}, function(data) {
        that.processTracks(data, count + data.items.length);
      });
    } else {
      this.setState({
        status: 'fetched'
      });
      this.populateRelatedArtists(function() {
        that.setState({
          status: 'graphing'
        });
        setTimeout(function() {
          that.constructGraph();
          that.setState({
            status: 'graphed'
          });
          that.computePlaylists();
        }, 100);
      });
    }
  },

  constructGraph: function() {
    var graph = new Graph();
    for (var artistId in this.state.artistsMap) {
      var artist = this.state.artistsMap[artistId];
      var value = _.keys(artist.relatedMap).length;

      graph.addNode(artistId, {
        label: artist.name, 
        value: value * 10,
        title: artist.name + '(' + value + ' connections)'
      });

      for (var relatedId in artist.relatedMap) {
        graph.addEdge(artistId, relatedId);
      }
    }
    this.setState({
      graph: graph,
      visGraph: graph.getVisGraph()
    });
  },

  computePlaylists: function() {
    var MINIMUM_PLAYLIST_SIZE = 8;
    var components = this.state.graph.getWeaklyConnectedComponents();
    var that = this;
    var playlists = [];
    _.each(components, function(component) {
      var playlist = [];
      _.each(component, function(artistId) {
        var artist = that.state.artistsMap[artistId];
        for (var trackId in artist.tracksMap) {
          var track = artist.tracksMap[trackId];
          playlist.push({
            track: track.name,
            artist: artist.name
          });
        }
      });
      if (playlist.length >= MINIMUM_PLAYLIST_SIZE) {
        playlists.push(playlist);
      }
    });
    this.setState({
      playlists: playlists
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
    var ratioStr = this.state.tracksFetched + '/' + this.state.tracksTotal;
    var labelMap = {
      login: 'Login To Spotify',
      fetch: 'Fetch Songs',
      fetching: 'Fetching songs (' + ratioStr + ')',
      fetched: 'Computing artist relatedness...',
      graphing: 'Constructing network graph...'
    };
    var actionMap = {
      login: Spotify.authorizeUser,
      fetch: this.fetchTracks
    };
    var actionButton = (
      <button className='btn btn-default btn-lg' 
        onClick={actionMap[this.state.status]}>
        {labelMap[this.state.status]}
      </button>
    );

    if (this.state.status == 'graphed') {
      var constructPlaylist = function(playlist) {
        return _.map(playlist, function(trackData) {
          return (
            <tr>
              <td>{trackData.track}</td>
              <td>{trackData.artist}</td>
            </tr>
          );
        });
      }
      var playlists = _.map(this.state.playlists, function(playlist, index) {
        var playlistElement = constructPlaylist(playlist);
        return (
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Playlist {index + 1}
              </h3>
            </div>
            <table className="table table-striped">
              <tdata>
                <tr>
                  <td><strong>Song</strong></td>
                  <td><strong>Artist</strong></td>
                </tr>
                {playlistElement}
              </tdata>
            </table>
          </div>
        );
      });
      console.log('playlists element', playlists);
      return (
        <div>
          <GraphView graph={this.state.visGraph} />
          <div className="container">
            {playlists}
          </div>
        </div>
      );
    }
    return (
      <div>
        {actionButton}
        <GraphView graph={this.state.visGraph} />
      </div>
    );
  }
});
