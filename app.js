var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));

// View engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

require('./routes')(app);

app.listen(port, function () {
  console.log('Listening on', port);
});
