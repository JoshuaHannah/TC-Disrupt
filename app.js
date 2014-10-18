'use strict';

var express = require('express');
var uuid = require('uuid');
var request = require('request');

var app = express();

app.use(express.static(__dirname + '/public'));

var players = [
  'Taimur': {money: 2500, color: 0, pos: []},
  'Josh': {money: 2500, color: 1, pos: []},
  'Lewis': {money: 2500, color: 2, pos: []},
  'Lukas': {money: 2500, color: 3, pos: []}
];

var streets = {};

var isInPoly = function(lat, lng, res) {
  var url = "http://services.arcgis.com/XCbo5t7BF3Awl0lX/arcgis/rest/services/MonopolyStreets/FeatureServer/0/query?where=&objectIds=&time=&geometry="+lat+"%2C"+lng+"&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&distance=&units=esriSRUnit_Meter&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&f=pjson&token=";
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (error) {
      console.log(error);
      return;
    }
    if (response.statusCode == 200) {
      if (body.features.length === 0) {
        return res(false);
      }
      return res({
        name: body.features[0].attributes.street,
        price: body.features[0].attributes.price,
        rent: body.features[0].attributes.rent
      });
    }
  });
};

console.log('1');
isInPoly(10,10, function(res) {
  console.log(res);
});
console.log('2');
isInPoly(-0.067403,51.516961, function(res) {
  console.log(res);
});

app.post('/position', function(req, res) {
  var username = req.query.username;
  var lat = req.query.lat;
  var lng = req.query.lng;

  players.forEach(function(player) {
    if (player.name !== username) {
      return;
    }
    pos.push([lat, lng]);
    isInPoly(lat, lng, function(hit) {
      if (!hit || (player.last_hit && player.last_hit === hit.name)) {
        player.last_hit = undefined;
        return res.jsonp({
          msg: 'OK'
        });
      }

      if (streets[hit.name]) {
        var owner = streets[hit.name];
        if (owner === player) {
          return res.jsonp({
            msg: 'OK'
          })
        }
        players[owner].money += hit.rent;
        player

      }

      player.money -= hit.rent;
      player.last_hit = hit.name;
      
      
    });
  });




  return;
});

// req.query: url params
// req.params: route params
// curl -X POST "http://localhost:3333/login?email=lukas@test.de&password=12345678"


var server = app.listen(3333, function() {
  console.log('Listening on port %d', server.address().port);
});
