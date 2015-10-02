var PlaylistPanel = React.createClass({
  propTypes: {
    playlist: React.PropTypes.arrayOf(React.PropTypes.object)
  },

  getDefaultProps: function() {
    return {
      playlist: {
        tracks: [],
        artists: [],
        genresMap: []
      },
      title: 'Playlist'
    };
  },

  getInitialState: function() {
    return {
      expanded: true,
      title: this.props.title
    };
  },

  componentDidMount: function() {
    var title = this.computeGenresTitle();
    title = title[0].toUpperCase() + title.substring(1, title.length);
    this.setState({
      title: title
    })
  },

  toggle: function() {
    this.setState({
      expanded: true // !this.state.expanded
    });
  },

  computeGenresTitle: function() {
    var genresMap = this.props.playlist.genresMap;
    var genres = _.keys(genresMap);
    var sortedGenres = _.sortBy(genres, function(genre) {
      return -1 * genresMap[genre];
    });
    var topGenres = sortedGenres.splice(0, 4);
    // Title-ify the conjunction of all four top genres
    var title = _.map(topGenres, function(genre) {
      return _.map(genre.split(' '), function(w) {
        return w[0].toUpperCase() + w.substring(1, w.length)
      }).join(' ');
    }).join(', ');
    return title || this.props.title;
  },

  render: function() {
    var linkStyle = {
      cursor: 'pointer',
      textDecoration: 'none'
    };

    var panelBody = (
      <div style={{overflow:'scroll',maxHeight:'400px'}}>
        <table className='table table-striped'>
          <tr>
            <td><strong>Song</strong></td>
            <td><strong>Artist</strong></td>
          </tr>
          {_.map(this.props.playlist.tracks, function(track) {
            return (
              <tr>
                <td>{track.name}</td>
                <td>{_.pluck(track.artists, 'name').join(', ')}</td>
              </tr>
            );
          })}
        </table>
      </div>
    );

    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          <a onClick={this.toggle} style={linkStyle}>
            <h3 className='panel-title'>
              {this.state.title}
            </h3>
          </a>
        </div>
        {this.state.expanded ? panelBody : null}
      </div>
    );
  }
});
