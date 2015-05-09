var SongSort = React.createClass({
  getInitialState: function() {
    return {
      tracks: [],
      isAuthorized: Spotify.getAccessToken()
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
    var tracks = _.pluck(trackData.items, 'track');
    this.setState({
      tracks: this.state.tracks.concat(tracks)
    });
    this.render();
    if (trackData.next) {
      Spotify.callSpotify(trackData.next, {}, this.showTracks);
    }
  },

  render: function() {
    var trackTableData = (
      _.map(this.state.tracks, function(track) {
        var artists = '';
        _.each(track.artists, function(artist) {
          artists += artist.name + ',';
        });
        return (
          <tr>
            <td>{artists.substring(0, artists.length-1)}</td>
            <td>{track.name}</td>
          </tr>
        );
      })
    );
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
        <table className="table table-striped">
          <tdata>
            {trackTableData}
          </tdata>
        </table>
      </div>
    );
  }
});
