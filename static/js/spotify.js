var Spotify = {
  authorizeUser: function() {
    var client_id = 'ceb07c0171874630bb8c4e9ca615b3bd';
    var redirect_uri = document.location.origin;
    var url = 'https://accounts.spotify.com/authorize?client_id=' + 
      client_id +
      '&response_type=token' +
      '&scope=user-library-read' +
      '&redirect_uri=' + encodeURIComponent(redirect_uri);
    document.location = url;
  },

  getAccessToken: function() {
    var allArgs = location.hash.replace(/#/g, '').split('&');
    var args = {};
    _.each(allArgs, function(kvp) {
      var kv = kvp.split('=');
      var key = kv[0];
      var val = kv[1];
      args[key] = val;
    });
    return args.access_token;
  },

  fetchCurrentUserProfile: function(callback) {
    this.callSpotify(
      'https://api.spotify.com/v1/me', 
      null, 
      callback
    );
  },

  fetchSavedTracks: function(callback) {
    this.callSpotify(
      'https://api.spotify.com/v1/me/tracks', 
      {}, 
      callback
    );
  },

  fetchRelatedArtists: function(artistId, callback) {
    this.callSpotify(
      this.getConfig().spotifyHost + 
      'v1/artists/' + artistId + '/related-artists',
      {}, 
      callback
    );
  },

  callSpotify: function(url, data, callback) {
    $.ajax(url, {
      dataType: 'json',
      data: data,
      headers: {
        'Authorization': 'Bearer ' + this.getAccessToken()
      },
      success: callback,
      error: callback
    });
  },

  getConfig: function() {
    return {
      apiKey: '76GAACLUE3U6MTBR9',
      spotifyHost: 'https://api.spotify.com/',
      echoNestHost: 'http://developer.echonest.com/'
    };
  }
};
