'use strict';

var express = require('express');
var uuid = require('uuid');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/data', function(req, res) {
  res.jsonp({
    test: 'hi'
  });
  return;
});

// req.query: url params
// req.params: route params
// curl -X POST "http://localhost:3333/login?email=lukas@test.de&password=12345678"


var server = app.listen(3333, function() {
  console.log('Listening on port %d', server.address().port);
});
