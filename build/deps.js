var deps = {
	Leaflet: {
		src: ['../scripts/georeactor-client.js', '../scripts/georeactor-leaflet.js']
	},
	Google: {
  	src: ['../scripts/georeactor-client.js', '../scripts/georeactor-gmaps.js']
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
