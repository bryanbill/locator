import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { transform } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";

/**
 * @type {Map}
 */
let map;

/**
 * @type {View}
 */
let view;


let coordinates = [];

/**
 * @type {VectorLayer}
 */
let markerLayer;


const init = () => {
    view = new View({
        center: [0, 0],
        zoom: 2,
    });


    map = new Map({
        target: "map",
        layers: [
            new TileLayer({
                source: new OSM(),
            })
        ],
        view: view,
    });

    document.getElementById("locate").addEventListener("click", (e) => {
        e.preventDefault();
        locate();
    });
};

const addMarker = (coord) => {
    if (coordinates.length < 2 || !markerLayer) {
        markerLayer = new VectorLayer({
            source: new VectorSource({
                features: [
                    new Feature({
                        geometry: new Point(coord),
                    }),
                ],
            }),
        });

        map.addLayer(markerLayer);
    } else {
        markerLayer.getSource().clear();
        markerLayer.getSource().addFeature(
            new Feature({
                geometry: new Point(coord),
            })
        );

        markerLayer.getSource().addFeature(
            new Feature({
                geometry: new LineString(coordinates),
            })
        );
    }

    view.animate({
        duration: 2000,
        center: coord,
        zoom: 18,
    });
}


const locate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                let { latitude, longitude } = position.coords;
                const coords = transform(
                    [longitude, latitude],
                    "EPSG:4326",
                    "EPSG:3857"
                );
                coordinates.push(coords);

                addMarker(coordinates[coordinates.length - 1]);
            },
            console.error,
            {
                enableHighAccuracy: true,
                maximumAge: 5,
            }
        );
    }
};

window.onload = init;
