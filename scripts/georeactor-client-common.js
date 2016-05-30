/* @flow */

var globalBounds = null;
var fitBounds, initMap, mapJSONfile;

if (typeof console === 'undefined') {
  console = {
    log: function() {},
    error: function() {}
  }
}

function makeRequestFor(datafile, callback) {
  // XMLHttpRequest without jQuery
  var df = datafile;
  var request = new XMLHttpRequest();
  request.open('GET', datafile, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        // consume GeoJSON or TopoJSON file
        var gj = null;
        var datafile = df.toLowerCase();
        if (datafile.indexOf('topojson') > -1 || datafile.indexOf('topo.json') > -1) {
          var tj = JSON.parse(this.responseText);
          var key = Object.keys(tj.objects)[0];
          gj = topojson.feature(tj, tj.objects[key]);
        } else if (datafile.indexOf('geojson') > -1 || datafile.indexOf('geo.json') > -1) {
          gj = JSON.parse(this.responseText);
        } else {
          throw 'data type unknown: ' + datafile;
        }

        // get info on bounds and properties for each data file
        for (var f = 0; f < gj.features.length; f++) {
          for (var key in gj.features[f].properties) {
            var val = gj.features[f].properties[key];
            if (!valuesForField[key]) {
              valuesForField[key] = {
                min: null,
                max: null,
                existCount: 0
              };
            }
            if (!valuesForField[key].min || val < valuesForField[key].min) {
              valuesForField[key].min = val;
            }
            if (!valuesForField[key].max || val > valuesForField[key].max) {
              valuesForField[key].max = val;
            }
            if (val) {
              valuesForField[key].existCount++;
            }
          }

          var bounds = makeBounds(gj.features[f].geometry.coordinates);
          gj.features[f].properties.bounds = bounds;
          if (!globalBounds) {
            globalBounds = bounds;
          } else {
            globalBounds[0] = Math.min(globalBounds[0], bounds[0]);
            globalBounds[1] = Math.min(globalBounds[1], bounds[1]);
            globalBounds[2] = Math.max(globalBounds[2], bounds[2]);
            globalBounds[3] = Math.max(globalBounds[3], bounds[3]);
          }
        }
        fitBounds(globalBounds);

        callback(gj);
      } else {
        console.log('failed to do XMLHttpRequest');
      }
    }
  };
  request.send();
}

function makeBounds(coordinates, existing) {
  if (!existing) {
    existing = [180, 90, -180, -90];
  }
  if (typeof coordinates[0] === 'number') {
    existing[0] = Math.min(existing[0], coordinates[0]);
    existing[1] = Math.min(existing[1], coordinates[1]);
    existing[2] = Math.max(existing[2], coordinates[0]);
    existing[3] = Math.max(existing[3], coordinates[1]);
  } else {
    for (var c = 0; c < coordinates.length; c++) {
      existing = makeBounds(coordinates[c], existing);
    }
  }
  return existing;
}

// forEach and map support for IE<=8 needed for TopoJSON library
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn,scope){
    var i, len;
    for (i = 0, len = this.length; i < len; ++i) {
      if(i in this){
        fn.call(scope, this[i], i, this);
      }
    }
  };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
