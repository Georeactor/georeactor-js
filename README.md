# GeoReactor JS

[![Greenkeeper badge](https://badges.greenkeeper.io/Georeactor/georeactor-js.svg)](https://greenkeeper.io/)

GeoReactor is an experimental library for creating interactive, mobile-responsive maps.

* Place your data on top of Google Maps or OpenStreetMap
* Developer-friendly presets, user-friendly UI for different datasets
* See it on desktop, mobile, and embedded maps
* Update your data and refresh the map

## Examples

* <a href="http://georeactor.github.io/georeactor-js/gmaps.html">Google Maps API</a>

* <a href="http://georeactor.github.io/georeactor-js/leaflet.html">Leaflet + OSM</a>

#### A basic Google Map

Include the common GeoReactor Client library, and the GeoReactor Google Maps (gmaps) extension (the extension loads the Google Maps API library).

Send an array of data URLs to the library to download and display that data.

```html
<div id='map'></div>
...
<script src='dist/georeactor-client-gmaps.js'></script>
<script>
  georeactor({
    div: 'map',
    API_KEY: 'AAAAA',
    data: ['data/link.geojson']
  })
</script>
```

#### A custom Leaflet map

Include LeafletJS, the common GeoReactor Client library, and the GeoReactor Leaflet extension.

Send an array of data URLs to the library to download and display that data.

You can set your background tile layers.

```html
<div id='custom-div-id'></div>
...
<script src='dist/georeactor-client-leaflet.js'></script>
<script>
  georeactor({
    div: 'custom-div-id',
    data: ['data/link.geojson'],
    // optional custom tiles (Leaflet and Google modes)
    tiles: ['//{s}.example.com/{z}/{x}/{y}.png']
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
<script src='dist/georeactor-client-leaflet.js'></script>
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
