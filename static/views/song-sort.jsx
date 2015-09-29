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
    var MAX_NUMBER_OF_SONGS = 120;
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
        artistsMap[artist.id].tracksMap[track.id] = track;
      });
    });

    that.setState({ 
      artistsMap: artistsMap,
      tracksFetched: this.state.tracksFetched + trackData.items.length,
      tracksTotal: trackData.total || this.state.tracksTotal,
      status: 'fetching'
    });

    if (trackData.next && count < MAX_NUMBER_OF_SONGS) {
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
    var playlists = this.computePlaylists(graph);

    var artistInPlaylist = function(artist) {
      for (var i in playlists) {
        var playlist = playlists[i];
        for (var j in playlist) {
          if (playlist[j].artist === artist.name) {
            return i;
          }
        }
      }
      return -1;
    };

    var colors = [
      '#e67e22', '#e74c3c', '#9b59b6', 
      '#f1c40f', '#bdc3c7', '#3498db',
      '#1abc9c', '#ecf0f1'
    ];

    for (var artistId in this.state.artistsMap) {
      var artist = this.state.artistsMap[artistId];
      var playlistNum = artistInPlaylist(artist);
      if (playlistNum < 0) {
        graph.removeNode(artistId);
      } else {
        var color = colors[playlistNum % colors.length];
        graph.updateNode(artistId, { color: color });
      }
    }

    this.setState({
      graph: graph,
      visGraph: graph.getVisGraph(),
      playlists: playlists
    });
  },

  computePlaylists: function(graph) {
    var MINIMUM_PLAYLIST_SIZE = 6;
    var components = graph.getWeaklyConnectedComponents();
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
    return playlists;
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
      return (
        <div>
          <GraphView graph={this.state.visGraph} />
          <div className="container">
            <Tabs defaultActiveKey={2} position='left' tabWidth={3}>
            { _.map(this.state.playlists, function(playlist, index) {
                var title = 'Playlist (' + playlist.length + ' songs)';
                return (
                  <Tab eventKey={index} title={title}>
                    <PlaylistPanel playlist={playlist}/>
                  </Tab>
                );
              })
            }
            </Tabs>
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
