/*
 GeoReactor-Client 0.1.1+4419fdb  http://georeactor.com
 (c) 2016 Nicholas Doiron (under open source, MIT license)
*/
!function(t,e,o){"undefined"==typeof console&&(console={log:function(){},error:function(){}}),Array.prototype.forEach||(Array.prototype.forEach=function(t,e){var o,a;for(o=0,a=this.length;o<a;++o)o in this&&t.call(e,this[o],o,this)}),"map"in Array.prototype||(Array.prototype.map=function(t,e){for(var o=new Array(this.length),a=0,n=this.length;a<n;a++)a in this&&(o[a]=t.call(e,this[a],a,this));return o}),(t||global).georeactor=function(){console.error("GEOREACTOR: no maps library was added")},(t||global).GEOREACTOR={data:[],options:{},valuesForField:{},_:{}},function(){function t(t,a){var n=t,r=new XMLHttpRequest;r.open("GET",t,!0),r.onreadystatechange=function(){if(4===this.readyState)if(this.status>=200&&this.status<400){var t=null,r=n.toLowerCase();if(r.indexOf("topojson")>-1||r.indexOf("topo.json")>-1){var i=JSON.parse(this.responseText),s=Object.keys(i.objects)[0];t=topojson.feature(i,i.objects[s])}else{if(!(r.indexOf("geojson")>-1||r.indexOf("geo.json")>-1))throw"data type unknown: "+r;t=JSON.parse(this.responseText)}t.features.map(function(t){var a=Object.keys(t.properties);a.map(function(e){var o=t.properties[e];GEOREACTOR.valuesForField[e]||(GEOREACTOR.valuesForField[e]={min:o,max:o,nonZeroCount:0}),o<GEOREACTOR.valuesForField[e].min&&(GEOREACTOR.valuesForField[e].min=o),o>GEOREACTOR.valuesForField[e].max&&(GEOREACTOR.valuesForField[e].max=o),o&&GEOREACTOR.valuesForField[e].nonZeroCount++});var n=e(t.geometry.coordinates);t.properties.bounds=n,o?(o[0]=Math.min(o[0],n[0]),o[1]=Math.min(o[1],n[1]),o[2]=Math.max(o[2],n[2]),o[3]=Math.max(o[3],n[3])):o=n}),GEOREACTOR._.fitBounds(o),a(t)}else console.log("failed to do XMLHttpRequest")},r.send()}function e(t,o){if(o||(o=[180,90,-180,-90]),"number"==typeof t[0])o[0]=Math.min(o[0],t[0]),o[1]=Math.min(o[1],t[1]),o[2]=Math.max(o[2],t[0]),o[3]=Math.max(o[3],t[1]);else for(var a=0;a<t.length;a++)o=e(t[a],o);return o}var o;GEOREACTOR.commonDataLoader=function(){0===GEOREACTOR.options.data.length&&console.log("GEOREACTOR: no datasets to load"),GEOREACTOR.options.data.map(function(e){t(e,function(t){GEOREACTOR._.mapJSONfile(t)})})}}(),function(){if("undefined"==typeof GEOREACTOR)return void console.error("GEOREACTOR: georeactor-client.js must be loaded for georeactor-leaflet to work");GEOREACTOR.library="leaflet";var t,o;GEOREACTOR._.mapJSONfile=function(e){return dataLayer=L.geoJson(e,{style:function(t){return{fillColor:"#f00",fillOpacity:0,color:"#444",weight:2}},onEachFeature:function(e,a){if(GEOREACTOR.options.popups){var n=["bounds"],r=Object.keys(e.properties),i="<table>";r.map(function(t){n.indexOf(t)>-1||(i+="<tr><td>"+t+"</td><td>"+e.properties[t]+"</td></tr>")}),i+="</table>",a.bindPopup(i)}a.on("click",function(){if("function"==typeof GEOREACTOR.initReact&&GEOREACTOR.initReact(),o&&t.removeLayer(o),"Point"===e.geometry.type){var a=e.geometry.coordinates.concat([]);a.reverse(),o=L.circleMarker(a,{radius:80,strokeColor:"#f00",fillColor:"#f00"}).addTo(t)}GEOREACTOR._.fitBounds(e.properties.bounds),GEOREACTOR.selectFeature=e,GEOREACTOR._.detailView&&GEOREACTOR._.detailView.setState({selectFeature:e}),dataLayer.setStyle(function(t){var o=0;return e===t&&(o=.2),{fillColor:"#f00",fillOpacity:o,color:"#444",weight:1}})})}}).addTo(t),dataLayer},georeactor=function(o){if(GEOREACTOR.options=o,t=L.map(o.div||"map").setView([o.lat||0,o.lng||o.lon||0],o.zoom||5),t.attributionControl.setPrefix(""),"function"==typeof L.Hash&&new L.Hash(t),GEOREACTOR.options.tiles&&GEOREACTOR.options.tiles.length)if("string"==typeof GEOREACTOR.options.tiles)L.tileLayer(GEOREACTOR.options.tiles,{maxZoom:17}).addTo(t);else{var a={};GEOREACTOR.options.tiles.forEach(function(e,o){e=L.tileLayer(e,{maxZoom:17}).addTo(t),a["ABCDEFGHIJKLMNOPQRSTUVWXYZ"[o]]=e}),L.control.layers(a,{}).addTo(t)}else{var n=L.tileLayer("//tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png",{attribution:"Map data &copy; OpenStreetMap contributors",maxZoom:17}).addTo(t),r=L.tileLayer("//{s}.tiles.mapbox.com/v3/mapmeld.map-a6ineq7y/{z}/{x}/{y}.png?updated=65f7243",{attribution:"Map data &copy; OpenStreetMap contributors; satellite from MapBox",maxZoom:17});L.control.layers({OpenStreetMap:n,Satellite:r},{}).addTo(t),t.on("baselayerchange",function(){})}var i=e.getElementsByClassName("leaflet-control-layers-toggle");i.length&&setTimeout(function(){i[0].style.backgroundImage="url(styles/lib/images/layers.png)"},200),GEOREACTOR._.fitBounds=function(e){t.fitBounds(L.latLngBounds(L.latLng(e[1],e[0]),L.latLng(e[3],e[2])))},GEOREACTOR.commonDataLoader(),"function"==typeof GEOREACTOR.initReact&&GEOREACTOR.initReact()}}()}(window,document);