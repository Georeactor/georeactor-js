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
          GEOREACTOR._.detailView.setState({ selectFeature: feature });
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
      .setView([0, 0], 5);
    map.attributionControl.setPrefix('');
    if (typeof L.Hash === 'function') {
      new L.Hash(map);
    }

    if (!GEOREACTOR.options.tiles || !GEOREACTOR.options.tiles.length) {
      osm = L.tileLayer('//tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; OpenStreetMap contributors',
        maxZoom: 17
      }).addTo(map);
      sat = L.tileLayer('//{s}.tiles.mapbox.com/v3/mapmeld.map-a6ineq7y/{z}/{x}/{y}.png?updated=65f7243', {
        attribution: 'Map data &copy; OpenStreetMap contributors; satellite from MapBox',
        maxZoom: 17
      });
      L.control.layers({
        "OpenStreetMap": osm,
        "Satellite": sat
      }, {}).addTo(map);
      var layerControl = document.getElementsByClassName("leaflet-control-layers-toggle")[0];
      setTimeout(function() {
        layerControl.style.backgroundImage = 'url(styles/lib/images/layers.png)';
      }, 200);
      map.on('baselayerchange', function() {
        /* update default lines */
      });
    } else {
      /* custom tiles */
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