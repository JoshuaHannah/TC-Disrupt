'use strict';

var express = require('express');
var uuid = require('uuid');
var request = require('request');

var app = express();

app.use(express.static(__dirname + '/public'));

var players = {
  'Taimur': {money: 1500, color: 0, pos: [-0.067403,51.516961]},
  'Josh': {money: 1500, color: 1, pos: [-0.067403,51.526961]},
  'Lewis': {money: 1500, color: 2, pos: [-0.067503,51.516961]},
  'Lukas': {money: 1500, color: 3, pos: [-0.067403,51.516991]}
};

var streets = {};

var isInPoly = function(lng, lat, res) {
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

/*console.log('1');
isInPoly(10,10, function(res) {
  console.log(res);
});
console.log('2');
isInPoly(-0.067403,51.516961, function(res) {
  console.log(res);
});*/

app.get('/data', function(req, res) {
  return res.jsonp(players);
});
app.get('/position', function(req, res) {
  var username = req.query.username;
  var lat = req.query.lat;
  var lng = req.query.lng;

  if (!(username in players)) {
    return res.jsonp({
      msg: 'WRONG USERNAME'
    });
  }

  var player = players[username];

  if ('game_over' in player) {
    return res.jsonp({
      msg: 'GAME OVER'
    });
  }

  player.pos = [lat, lng];
  isInPoly(lat, lng, function(hit) {
    if (!hit) {
      player.last_hit = undefined;
      return res.jsonp({
        msg: 'OK'
      });
    }
    if ('last_hit' in player && player.last_hit === hit.name) {
      return res.jsonp({
        msg: 'OK'
      });
    }

    hit.rent = parseInt(hit.rent);
    hit.price = parseInt(hit.price);


    // street has an owner
    if (hit.name in streets) {
      var owner = streets[hit.name];
      if (owner === username) {
        return res.jsonp({
          msg: 'OK'
        });
      }
      // pay rent
      if (player.money < hit.rent) {
        players[owner].money += player.money;
        player.money = 0;
        // game over
        player.game_over = true;
        for (var s in streets) {
          if (streets[s] === username) {
            streets[s] = undefined;
          }
        }
        return res.jsonp({
          msg: 'GAME OVER'
        });
      }
      players[owner].money += hit.rent;
      player.money -= hit.rent;
      return res.jsonp({
        msg: 'PAID RENT',
        amount: hit.rent,
        street: hit.name
      });
    }
    // buy
    else {
      if (hit.name === 'Jail') {
        for (s in streets) {
          if (streets[s] === username) {
            streets[s] = undefined;
            return res.jsonp({
              msg: 'OK'
            });
          }
        }
        return res.jsonp({
          msg: 'OK'
        });
      }
      else if (hit.name === 'Free Parking') {
        // TODO get random street
        return res.jsonp({
          msg: 'OK'
        });
      }

      if (player.money < hit.price) {
        return res.jsonp({
          msg: 'OK'
        });
      }
      streets[hit.name] = username;
      player.money -= hit.price;
      return res.jsonp({
        msg: 'BOUGHT',
        street: hit.name,
        amount: hit.rent
      });
    }

    return res.jsonp({
      msg: 'UNKNOWN ERROR',
    });
      
  });




  return;
});

// req.query: url params
// req.params: route params
// curl -X POST "http://localhost:3333/login?email=lukas@test.de&password=12345678"


var server = app.listen(process.env.PORT || 3333, function() {
  console.log('Listening on port %d', server.address().port);
});
