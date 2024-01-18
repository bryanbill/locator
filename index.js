import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { transform } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";

import { openDB } from "idb";

/**
 * @type {Map}
 */
let map;

/**
 * @type {View}
 */
let view;

/**
 * @type {Coordinate[]}
 */
let coordinates = [];

/**
 * @type {VectorLayer}
 */
let markerLayer;

/**
 * @type {import("idb").IDBPDatabase}
 */
let db;

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

    getCoordsFromCache().then(() => {
        if (coordinates.length) drawLines();
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
};



const drawLines = () => {
    markerLayer = new VectorLayer({
        source: new VectorSource({
            features: [
                new Feature({
                    geometry: new LineString(coordinates),
                }),
                new Feature({
                    geometry: new Point(coordinates[coordinates.length - 1]),
                }),
            ],
        }),
    });

    map.addLayer(markerLayer);
    view.animate({
        duration: 2000,
        center: coordinates[coordinates.length - 1],
        zoom: 18,
    });
};

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
                cache(coords);
            },
            console.error,
            {
                enableHighAccuracy: true,
                maximumAge: 5,
            }
        );
    }
};
/**
 *
 * @param {Coordinate} coords
 */
const cache = async (coords) => {
    try {
        if (!("indexedDB" in window)) {
            console.error("IndexedDB not supported");
            return;
        }

        const tx = db.transaction("coordinates", "readwrite");
        await tx.store.add({
            x: coords[0],
            y: coords[1],
            timestamp: Date.now(),
        });
    } catch (err) {
        console.error(err);
    }
};

const getCoordsFromCache = async () => {
    if (!("indexedDB" in window)) return console.error("IndexedDB not supported");

    db = await openDB("locator", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("coordinates")) {
                db.createObjectStore("coordinates", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        },
    });

    const tx = db.transaction("coordinates", "readwrite");

    let cursor = await tx.store.openCursor();

    while (cursor) {
        const timestamp = cursor.value.timestamp;

        if (Date.now() - timestamp < 86400000) {
            const coords = [cursor.value.x, cursor.value.y];
            coordinates.push(coords);
        }

        cursor = await cursor.continue();
    }
};

window.onload = init;
