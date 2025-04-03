// Street View: googleStreets =  L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
// Hybrid View: googleHybrid =   L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
// Satellite View: googleSat =   L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
// Terrain View: googleTerrain = L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });

const locations = JSON.parse(document.querySelector('#map').dataset.locations);
console.log(locations);

const map = L.map('map', {
    scrollWheelZoom: false, // Disables zooming with the mouse wheel
    doubleClickZoom: false, // Disables zooming on double-click
    touchZoom: false, // Disables zooming on touch devices
    zoomControl: false, // Removes the zoom control buttons
});

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png', {
    attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const markers = [];
const bounds = L.latLngBounds();
const options = {
    autoClose: false,
    closeOnClick: false,
    keepInView: true,
};
const myIcon = L.icon({
    iconUrl: '../img/pin.png',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -30],
});

locations.forEach((loc) => {
    const [y, x] = loc.coordinates;

    const marker = L.marker([x, y], { icon: myIcon })
        .addTo(map)
        .bindPopup(`<p>Day ${loc.day} : ${loc.description}</p>`, options);

    markers.push(marker);
    bounds.extend([x, y]);
});
map.fitBounds(bounds, { padding: [500, 200] }); // [horiz, vert] padding
markers.forEach((m) => m.openPopup());
