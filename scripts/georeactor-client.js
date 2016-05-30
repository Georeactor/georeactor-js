/* @flow */
/*global google, initReact, Array, detailView, topojson, georeactor, valuesForField */

(function() {
  var map;

  mapJSONfile = function(gj) {
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
      fitBounds(event.feature.getProperty('bounds'));
      detailView.setState({ selectFeature: event.feature });
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

  initMap = function() {
    map = new google.maps.Map(document.getElementById(georeactor.div), {
      zoom: 5,
      center: {lat: 0, lng: 0},
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      streetViewControl: false
    });

    fitBounds = function(bounds) {
      map.fitBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds[1], bounds[0]),
        new google.maps.LatLng(bounds[3], bounds[2])
      ));
    }

    for (var d = 0; d < georeactor.data.length; d++) {
      makeRequestFor(georeactor.data[d], function (gj) {
        mapJSONfile(gj);
      });
    }

    if (typeof initReact === 'function') {
      initReact();
    }
  };
})();
