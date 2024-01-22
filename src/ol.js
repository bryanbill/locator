import { Map, View, Feature, Geolocation } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Style, Stroke, Fill, Text } from "ol/style";

import { save, get } from "./db";

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

let isTracking = false;


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
                style: new Style({
                    stroke: new Stroke({
                        color: "#ffcc33",
                        width: 5,
                    }),
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

    get(Date.now() - 1000 * 60 * 60 * 24, Date.now()).then((result) => {
        coords.push(...result);

        drawPath();
    });
};

const locate = () => {
    geolocation.setTracking(isTracking = !isTracking);

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
        save(coordinates);
    });

    geolocation.on("change:accuracyGeometry", () => {
        accuracyFt.setGeometry(geolocation.getAccuracyGeometry());
    })

    geolocation.on("error", console.error);
};


const drawPath = () => {
    pathFeature.setGeometry(new LineString(coords));
    pathFeature.setStyle(new Style({
        text: new Text({
            text: "Last known position",
            offsetY: 25,
            fill: new Fill({
                color: "#000",
            }),
            stroke: new Stroke({
                color: "#fff",
                width: 2,
            }),
        }),
        stroke: new Stroke({
            color: "#ffcc33",
            width: 5,
        }),
    }));

    if (!isTracking) {
        view.animate({
            center: coords[coords.length - 1],
            zoom: 20,
            duration: 1000,
        });
    }
};

const filterTool = () => {
    const startBtn = document.getElementById("start");
    const endBtn = document.getElementById("end");

    let start;
    let end;

    startBtn.addEventListener("change", (e) => {
        start = new Date(e.target.value);

        console.log(start);

        if (end) {
            get(start, end).then((result) => {
                coords = result;

                console.log(coords);
                drawPath();
            });
        }
    })

    endBtn.addEventListener("change", (e) => {
        end = new Date(e.target.value).getTime() - new Date(e.target.value).getTimezoneOffset() * 60 * 1000;

        if (start) {
            get(start, end).then((result) => {
                coords = result;
                console.log(coords);
                drawPath();
            });
        }
    })
}

export {
    init,
    filterTool,
}