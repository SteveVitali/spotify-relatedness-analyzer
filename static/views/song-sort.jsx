var SongSort = React.createClass({
  getInitialState: function() {
    return {
      isAuthorized: Spotify.getAccessToken()
    };
  },

  getDefaultProps: function() {
    return {
      artistsMap: {},
      graph: {},
      count: 0
    };
  },

  fetchSongs: function() {
    var that = this;
    Spotify.fetchCurrentUserProfile(function(user) {
      if (user) {
        Spotify.fetchSavedTracks(function(data) {
          if (data) {
            that.showTracks(data);
          } else {
            console.log('Error: no data');
          }
        });
      } else {
        console.log('Error: could not log in');
      }
    });
  },

  showTracks: function(trackData) {
    this.props.count++;
    var that = this;
    _.each(trackData.items, function(item) {
      var track = item.track;

      _.each(track.artists, function(artist) {
        if (!(artist.id in that.props.artistsMap)) {
          that.props.artistsMap[artist.id] = {
            name: artist.name,
            tracksMap: {},
            relatedMap: {}
          };
        }
        that.props.artistsMap[artist.id].tracksMap[track.id] = {
          name: track.name
        };
      });
    });
    this.render();
    if (trackData.next && this.props.count < 2) {
      Spotify.callSpotify(trackData.next, {}, this.showTracks);
    } else {
      this.populateRelatedArtists(this.constructGraph);
    }
  },

  constructGraph: function() {
    console.log('constructing graph');
  },

  populateRelatedArtists: function(callback) {
    var that = this;
    var count = 0;
    var artistIds = _.keys(this.props.artistsMap);

    _.each(artistIds, function(artistId) {
      Spotify.fetchRelatedArtists(artistId, function(relateds) {
        _.each(relateds.artists, function(related) {
          if (related.id in that.props.artistsMap) {
            that.props.artistsMap[artistId].relatedMap[related.id] = {
              name: related.name
            };
            that.props.artistsMap[related.id].relatedMap[artistId] = {
              name: that.props.artistsMap[artistId].name
            };
          }
        });
        if (++count == artistIds.length) {
          callback();
        }
      });
    });
  },

  render: function() {
    var actionButton = (
      <button className='btn btn-default btn-lg' 
        onClick={this.state.isAuthorized 
          ? this.fetchSongs 
          : Spotify.authorizeUser}>
        {this.state.isAuthorized 
          ? 'Fetch Songs' 
          : 'Login to Spotify'}
      </button>
    );

    return (
      <div>
        {actionButton}
        <Graph graph={this.props.graph} />
      </div>
    );
  }
});
