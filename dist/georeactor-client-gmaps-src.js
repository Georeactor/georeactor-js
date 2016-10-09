/*
 GeoReactor-Client 0.1.1+470b123  http://georeactor.com
 (c) 2016 Nicholas Doiron (under open source, MIT license)
*/
(function (window, document, undefined) {if (typeof console === 'undefined') {
  console = {
    log: function() {},
    error: function() {}
  }
}

// Array.forEach and Array.map for TopoJSON to work in old browsers
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

(window || global).georeactor = function() {
  console.error('GEOREACTOR: no maps library was added');
};
(window || global).GEOREACTOR = {
  data: [],
  options: {},
  valuesForField: {},
  _: { }
};

(function() {
  var globalBounds;

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
          gj.features.map(function(feature) {
            var keys = Object.keys(feature.properties);
            keys.map(function(key) {
              var val = feature.properties[key];
              if (!GEOREACTOR.valuesForField[key]) {
                GEOREACTOR.valuesForField[key] = {
                  min: val,
                  max: val,
                  nonZeroCount: 0
                };
              }
              if (val < GEOREACTOR.valuesForField[key].min) {
                GEOREACTOR.valuesForField[key].min = val;
              }
              if (val > GEOREACTOR.valuesForField[key].max) {
                GEOREACTOR.valuesForField[key].max = val;
              }
              if (val) {
                GEOREACTOR.valuesForField[key].nonZeroCount++;
              }
            });

            var bounds = makeBounds(feature.geometry.coordinates);
            feature.properties.bounds = bounds;
            if (!globalBounds) {
              globalBounds = bounds;
            } else {
              globalBounds[0] = Math.min(globalBounds[0], bounds[0]);
              globalBounds[1] = Math.min(globalBounds[1], bounds[1]);
              globalBounds[2] = Math.max(globalBounds[2], bounds[2]);
              globalBounds[3] = Math.max(globalBounds[3], bounds[3]);
            }
          });
          GEOREACTOR._.fitBounds(globalBounds);

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

  GEOREACTOR.parseAttribute = function(prop, value) {
    var adjustedLabel = prop + '';
    var adjustedValue = (value || '') + '';
    var RegExpEscape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    if (GEOREACTOR.options && GEOREACTOR.options.attributes) {
      var propSettings = GEOREACTOR.options.attributes[adjustedLabel];
      if (propSettings === false) {
        // purposely asked not to display
        return false;

      } else if (typeof propSettings !== 'undefined' && propSettings !== null) {
        if (typeof propSettings.label === 'function') {
          adjustedLabel = propSettings.label(prop, value, GEOREACTOR.selectFeature);
        } else if (typeof propSettings.label === 'string') {
          adjustedLabel = propSettings.label;
        }
        if (typeof propSettings.value === 'function') {
          adjustedValue = propSettings.value(prop, value, GEOREACTOR.selectFeature);
        } else if (typeof propSettings.value === 'string') {
          var labelrg = new RegExp('#\\{' + RegExpEscape(prop) + '\\}', 'g');
          adjustedValue = propSettings.value.replace(labelrg, adjustedValue);
        }
      }
    }

    if (typeof adjustedValue === 'object') {
      adjustedValue = JSON.stringify(adjustedValue);
    }

    return [adjustedLabel, adjustedValue];
  };

  GEOREACTOR.sortPropKeys = function(properties) {
    if (GEOREACTOR.options.attributes && GEOREACTOR.options.attributes._order) {
      properties.sort(function(a,b) {
        var aOrder = GEOREACTOR.options.attributes._order.indexOf(a.label);
        var bOrder = GEOREACTOR.options.attributes._order.indexOf(b.label);
        if (aOrder !== bOrder) {
          if (aOrder === -1) {
            return 1;
          }
          if (bOrder === -1) {
            return -1;
          }
        }
        return aOrder - bOrder;
      });
    }
    return properties;
  };

  GEOREACTOR.commonDataLoader = function() {
    if (GEOREACTOR.options.data.length === 0) {
      console.log('GEOREACTOR: no datasets to load');
    }
    GEOREACTOR.options.data.map(function(dataset) {
      makeRequestFor(dataset, function (gj) {
        GEOREACTOR._.mapJSONfile(gj);
      });
    });
  };
})();



(function() {
  var map, infoWindow;

  if (typeof GEOREACTOR === 'undefined') {
    console.error('GEOREACTOR: georeactor-gmaps.js must be loaded for georeactor-gmaps to work');
    return;
  }
  GEOREACTOR.library = 'gmaps';

  GEOREACTOR._.mapJSONfile = function(gj) {
    map.data.addGeoJson(gj);
    map.data.setStyle(function (feature) {
      return {
        fillColor: '#f00',
        fillOpacity: 0,
        strokeColor: '#444',
        strokeWeight: 1
      }
    });
    map.data.addListener('click', function(event) {
      GEOREACTOR._.fitBounds(event.feature.getProperty('bounds'));
      GEOREACTOR.selectFeature = event.feature;
      if (GEOREACTOR._.detailView) {
        GEOREACTOR._.detailView.setState({ selectFeature: event.feature });
      }
      if (GEOREACTOR.options.popups) {
        var banProperties = ['bounds'];
        var txtTable = '<table>';
        var propKeys = [];
        var propVals = {};
        event.feature.forEachProperty(function(val, key) {
          propKeys.push(key);
          propVals[key] = val;
        });
        propKeys = GEOREACTOR.sortPropKeys(propKeys);
        propKeys.map(function(key) {
          if (banProperties.indexOf(key) > -1) {
            return;
          }
          var parsed = GEOREACTOR.parseAttribute(key, propVals[key]);
          if (parsed === false) {
            return;
          }
          txtTable += '<tr><td>' + parsed[0] + '</td><td>' + parsed[1] + '</td></tr>';
        });
        txtTable += '</table>';
        infoWindow.setPosition(event.latLng);
        infoWindow.setContent(txtTable);
        infoWindow.open(map);
      }
      map.data.setStyle(function (feature) {
        var fillOpacity = 0;
        if (feature === event.feature) {
          fillOpacity = 0.2;
        }
        return {
          fillColor: '#f00',
          fillOpacity: fillOpacity,
          strokeColor: '#444',
          strokeWeight: 1
        }
      });
    });
    return map.data;
  };

  GEOREACTOR.initMap = function() {
    map = new google.maps.Map(document.getElementById(GEOREACTOR.options.div || 'map'), {
      zoom: (GEOREACTOR.options.zoom || 5),
      center: {
        lat: (GEOREACTOR.options.lat || 0),
        lng: (GEOREACTOR.options.lng || GEOREACTOR.options.lon || 0)
      },
      streetViewControl: false
    });
    infoWindow = new google.maps.InfoWindow({ map: map });
    infoWindow.close();

    GEOREACTOR._.fitBounds = function(bounds) {
      map.fitBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds[1], bounds[0]),
        new google.maps.LatLng(bounds[3], bounds[2])
      ));
    }

    GEOREACTOR.commonDataLoader();

    if (typeof GEOREACTOR.initReact === 'function') {
      GEOREACTOR.initReact();
    }
  };

  georeactor = function(options) {
    if (window.location.hostname === 'localhost') {
      options.API_KEY = '';
    }
    GEOREACTOR.options = options;

    var sc = document.createElement('script');
    sc.src = '//maps.googleapis.com/maps/api/js?callback=GEOREACTOR.initMap&key=AIzaSyDfcomdn4y5hE1UblikOcMjtzY_ilhSP-4' // + (options.API_KEY || '');
    document.body.appendChild(sc);
  };
})();



}(window, document));
//# sourceMappingURL=georeactor-client-gmaps-src.map