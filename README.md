# GeoReactor JS

GeoReactor is an experimental library for creating interactive, mobile-responsive maps.

* Place your data on top of Google Maps or OpenStreetMap
* Developer-friendly presets, user-friendly UI for different datasets
* See it on desktop, mobile, and embedded maps
* Update your data and refresh the map

## Examples

* <a href="http://georeactor.github.io/georeactor-js/index.html">Google Maps API</a>

* <a href="http://georeactor.github.io/georeactor-js/leaflet.html">Leaflet + OSM</a>

#### A basic map

Include ReactJS, the common GeoReactor Client library, and the Google Maps (gmaps) extension.

Send an array of data URLs to the library to download and display that data.

```html
<div id='map'></div>
...
<script src='react.min.js'></script>
<script src='georeactor-client.js'></script>
<script src='georeactor-gmaps.js'></script>
<script>
  georeactor({
    div: 'map',
    data: ['data/link.geojson']
  })
</script>
```

#### A React table UI

Show information about map features using a ReactJS table. Control your data's appearance in the
display.

```html
<div id='map'></div>
...
<script src='react.min.js'></script>
<script src='georeactor-client.js'></script>
<script src='georeactor-gmaps.js'></script>
<script type='text/jsx' src='georeactor-detail.js'></script>
<script>
  georeactor({
    div: 'map',
    data: ['data/link.geojson'],

    /* data transform options */
    attributes: {
      _order: ['Title', 'AUTHOR', 'Description'],
      AUTHOR: {
        label: 'Author',
        value: 'Created by #{AUTHOR}'
      },
      Description: {
        value: function (key, val) {
          return val.substring(0, 100);
        }
      }
    }
  })
</script>
```

## License

MIT license
