(function() {
  var map;

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
      zoom: 5,
      center: {lat: 0, lng: 0},
      streetViewControl: false
    });

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
    GEOREACTOR.options = options;

    var sc = document.createElement('script');
    sc.src = '//maps.googleapis.com/maps/api/js?callback=GEOREACTOR.initMap&key=' + (options.API_KEY || '');
    document.body.appendChild(sc);
  };
})();
