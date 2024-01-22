import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Geolocation } from 'ol'

/**
 * @type {Map}
 */
let map;

/**
 * @type {View}
 */
let view;

let coords = [];

const accuracyFt = new Feature();

const positionFeature = new Feature();

const pathFeature = new Feature();

/**
 * @type {Geolocation}
 */
let geolocation;


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
            }),
            new VectorLayer({
                source: new VectorSource({
                    features: [pathFeature],
                }),
            }),
            new VectorLayer({
                source: new VectorSource({
                    features: [accuracyFt, positionFeature],
                }),
            }),
        ],
        view: view,
    });

    geolocation = new Geolocation({
        trackingOptions: {
            enableHighAccuracy: true,
        },
        projection: view.getProjection(),
    });

    document.getElementById("locate").addEventListener("click", (e) => {
        e.preventDefault();
        locate();
    });
};

const locate = () => {
    geolocation.setTracking(true);

    geolocation.on("change:position", () => {
        const coordinates = geolocation.getPosition();
        coords.push(coordinates);

        positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
        view.animate({
            center: coordinates,
            zoom: 15,
            duration: 1000,
        });

        drawPath();
    });

    geolocation.on("change:accuracyGeometry", () => {
        accuracyFt.setGeometry(geolocation.getAccuracyGeometry());
    })

    geolocation.on("error", console.error);
};


const drawPath = () => {
    pathFeature.setGeometry(new LineString(coords));
};

window.onload = init;
