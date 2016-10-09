/*
 GeoReactor-Client 0.1.1+4419fdb  http://georeactor.com
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
  if (typeof GEOREACTOR === 'undefined') {
    console.error('GEOREACTOR: georeactor-client.js must be loaded for georeactor-leaflet to work');
    return;
  }
  GEOREACTOR.library = 'leaflet';

  var map, clickCircle;

  GEOREACTOR._.mapJSONfile = function(gj) {
    dataLayer = L.geoJson(gj, {
      style: function (feature) {
        return {
          fillColor: '#f00',
          fillOpacity: 0,
          color: '#444',
          weight: 2
        }
      },
      onEachFeature: function (feature, layer) {
        if (GEOREACTOR.options.popups) {
          var banProperties = ['bounds'];
          var propKeys = Object.keys(feature.properties);
          var txtTable = '<table>';
          propKeys.map(function(key) {
            if (banProperties.indexOf(key) > -1) {
              return;
            }
            txtTable += '<tr><td>' + key + '</td><td>' + feature.properties[key] + '</td></tr>';
          });
          txtTable += '</table>';
          layer.bindPopup(txtTable);
        }
        layer.on('click', function() {
          if (typeof GEOREACTOR.initReact === 'function') {
            GEOREACTOR.initReact();
          }

          if (clickCircle) {
            map.removeLayer(clickCircle);
          }

          if(feature.geometry.type === 'Point') {
            var coord = feature.geometry.coordinates.concat([]);
            coord.reverse();
            clickCircle = L.circleMarker(coord, {
              radius: 80,
              strokeColor: '#f00',
              fillColor: '#f00'
            }).addTo(map);
          }

          GEOREACTOR._.fitBounds(feature.properties.bounds);
          GEOREACTOR.selectFeature = feature;
          if (GEOREACTOR._.detailView) {
            GEOREACTOR._.detailView.setState({ selectFeature: feature });
          }
          dataLayer.setStyle(function (styler) {
            var fillOpacity = 0;
            if (feature === styler) {
              fillOpacity = 0.2;
            }
            return {
              fillColor: '#f00',
              fillOpacity: fillOpacity,
              color: '#444',
              weight: 1
            }
          });
        });
      }
    }).addTo(map);
    return dataLayer;
  };

  georeactor = function(options) {
    GEOREACTOR.options = options;

    map = L.map(options.div || 'map')
      .setView([(options.lat || 0), (options.lng || options.lon || 0)], (options.zoom || 5));
    map.attributionControl.setPrefix('');
    if (typeof L.Hash === 'function') {
      new L.Hash(map);
    }

    if (!GEOREACTOR.options.tiles || !GEOREACTOR.options.tiles.length) {
      var osm = L.tileLayer('//tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; OpenStreetMap contributors',
        maxZoom: 17
      }).addTo(map);
      var sat = L.tileLayer('//{s}.tiles.mapbox.com/v3/mapmeld.map-a6ineq7y/{z}/{x}/{y}.png?updated=65f7243', {
        attribution: 'Map data &copy; OpenStreetMap contributors; satellite from MapBox',
        maxZoom: 17
      });
      L.control.layers({
        "OpenStreetMap": osm,
        "Satellite": sat
      }, {}).addTo(map);

      map.on('baselayerchange', function() {
        /* update default lines */
      });
    } else {
      /* custom tiles */
      if (typeof GEOREACTOR.options.tiles === 'string') {
        L.tileLayer(GEOREACTOR.options.tiles, {
          maxZoom: 17
        }).addTo(map);
      } else {
        var layers = {};
        GEOREACTOR.options.tiles.forEach(function(layer, i) {
          layer = L.tileLayer(layer, {
            maxZoom: 17
          }).addTo(map);
          layers['ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = layer;
        });
        L.control.layers(layers, {}).addTo(map);
      }
    }

    var layerControl = document.getElementsByClassName("leaflet-control-layers-toggle");
    if (layerControl.length) {
      setTimeout(function() {
        layerControl[0].style.backgroundImage = 'url(styles/lib/images/layers.png)';
      }, 200);
    }

    GEOREACTOR._.fitBounds = function(bounds) {
      map.fitBounds(L.latLngBounds(
        L.latLng(bounds[1], bounds[0]),
        L.latLng(bounds[3], bounds[2])
      ));
    }

    GEOREACTOR.commonDataLoader();

    if (typeof GEOREACTOR.initReact === 'function') {
      GEOREACTOR.initReact();
    }
  };
})();



}(window, document));
//# sourceMappingURL=georeactor-client-leaflet-src.map