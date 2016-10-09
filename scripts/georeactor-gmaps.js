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
