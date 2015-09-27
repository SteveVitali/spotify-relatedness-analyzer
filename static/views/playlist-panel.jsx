var PlaylistPanel = React.createClass({
  propTypes: {
    playlist: React.PropTypes.arrayOf(React.PropTypes.object)
  },

  getDefaultProps: function() {
    return {
      playlist: [],
      title: 'Playlist'
    };
  },

  getInitialState: function() {
    return {
      expanded: false
    };
  },

  toggle: function() {
    this.setState({
      expanded: !this.state.expanded
    });
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
        {_.map(this.props.playlist, function(trackData) {
          return (
            <tr>
              <td>{trackData.track}</td>
              <td>{trackData.artist}</td>
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
              {this.props.title}
            </h3>
          </a>
        </div>
        {this.state.expanded ? panelBody : null}
      </div>
    );
  }
});
