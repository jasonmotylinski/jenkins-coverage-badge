#! /usr/bin/env node

var request = require('request');
var express = require('express');

var app = express();

app.get('/jenkins/c/http/*', function(req,res) {
  var jurl = req.params[0]
  var url = 'http://' + jurl + '/lastSuccessfulBuild/cobertura/api/json/?depth=2'
  request(url, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      var elements = JSON.parse(body)['results']['elements']
      for (var i in elements) {
        if (elements[i]['name'] == 'Lines') {
          var cov = elements[i]['ratio'].toFixed(2)
          var color = function(cov) {
            if (cov < 20) {
              return 'red'
            } else if (cov < 80) {
              return 'yellow'
            } else {
              return 'brightgreen'
            }
          }(cov)
          var badge_url = 'https://img.shields.io/badge/coverage-' + cov.toString() + '%-' + color + '.svg'
          var style = req.param("style")
          if (typeof style != 'undefined') {
            badge_url += '?style=' + style
          }
          console.log('[GET] ' + '/jenkins/c/http/' + jurl)
          console.log('      generating badge(' + badge_url + ')')
          res.redirect(badge_url)
        }
      }
    } else {
      console.log(err)
      var badge_url = 'https://img.shields.io/badge/coverage-none-lightgrey.svg'
      console.log('[GET] ' + '/jenkins/c/http/' + jurl)
      console.log('      generating badge(' + badge_url + ')')
      res.redirect(badge_url)
    }
  })
})

app.get('/jenkins/t/http/*', function(req,res) {
  var jurl = req.params[0]
  var url = 'http://' + jurl + '/lastSuccessfulBuild/testReport/api/json'
  request(url, function(err, response, body) {
    var color = 'lightgrey';
    var word = 'uknown';

    if (!err && response.statusCode == 200) {
      var passCount = JSON.parse(body)['passCount'];
      var failCount = JSON.parse(body)['failCount'];
      var totalCount = passCount + failCount;
      var ratio = passCount / totalCount;
     

      if (failCount == 0 && passCount > 0){
        word = "passing";
        color = "green";
      }
      else if(fail > 0) {
        word = "failing";
        color = "red";
      }

      var color =
        ratio != ratio && "lightgrey" ||
        ratio == 1.0 && "brightgreen" ||
        ratio >= 0.5 && "yellow" ||
        "red";

      var badge_url = 'https://img.shields.io/badge/tests-' + passCount.toString() + '/' + totalCount + '-' + color + '.svg';
      var style = req.param("style")
      if (typeof style != 'undefined') {
        badge_url += '?style=' + style
      }
      console.log('[GET] ' + '/jenkins/t/http/' + jurl);
      console.log('      generating badge(' + badge_url + ')');
      res.redirect(badge_url);

    } else {
      console.log(err)
      var badge_url = 'https://img.shields.io/badge/tests-none-lightgrey.svg'
      console.log('[GET] ' + '/jenkins/t/http/' + jurl)
      console.log('      generating badge(' + badge_url + ')')
      res.redirect(badge_url)
    }
  })
});

var port = process.argv.slice(2)[0];
if (!port) port = 9913
  var server = app.listen(port, function() {
    console.log('Listening on port %d...', server.address().port)
  })
