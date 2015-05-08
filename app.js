var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;

// View engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/static/js/third-party'));
app.use(express.static(__dirname + '/static/js'));
app.use(express.static(__dirname + '/static/css'));

require('./routes')(app);

app.listen(port, function () {
  console.log('Listening on', port);
});

// Expose app
exports = module.exports = app
