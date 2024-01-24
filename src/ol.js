import { Map, View, Feature, Geolocation } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Style, Stroke, Icon } from "ol/style";

import { save, get, Relations } from "./db";
import man from "../assets/icons/man.png";
import { dialog } from "./ui";

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
        if (!result || !result.length) return;

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
        positionFeature.setStyle(new Style({
            image: new Icon({
                src: man,
                anchor: [0.5, 1],
            })
        }));

        view.animate({
            center: coordinates,
            zoom: 20,
            duration: 1000,
        });

        drawPath();
        save(coordinates);
    });

    geolocation.on("change:accuracyGeometry", () => {
        const accuracy = geolocation.getAccuracy();
        const speed = geolocation.getSpeed();
        const coords = geolocation.getAccuracyGeometry().getCoordinates();
        save(coords, { accuracy, speed, type: "Polygon" }, Relations.accuracy);

        accuracyFt.setGeometry(geolocation.getAccuracyGeometry());
    })

    geolocation.on("error", console.error);

};


const drawPath = () => {
    if (!coords || !coords.length) {
        pathFeature.setGeometry(null);
        view.animate({
            center: [0, 0],
            zoom: 2,
            duration: 1000,
        });
        
        dialog("Error", "No coordinates to draw path.");
        return;
    }

    pathFeature.setGeometry(new LineString(coords));
    pathFeature.setStyle(new Style({
        stroke: new Stroke({
            color: "#ffcc33",
            width: 10,
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
    const startInput = document.getElementById("start");
    const endInput = document.getElementById("end");

    let start;
    let end;

    startInput.addEventListener("change", (e) => {
        start = new Date(e.target.value).getTime();

        if (!end) return;

        if (start > end) {
            dialog("Error", "Start date must be before end date.");
            return;
        }

        get(start, end).then((result) => {
            coords = result;

            console.log(coords);
            drawPath();
        });
    })

    endInput.addEventListener("change", (e) => {
        end = new Date(e.target.value).getTime();

        if (!start) return;

        if (end < start) {
            dialog("Error", "Start date must be before end date.");
            return;
        }

        get(start, end).then((result) => {
            coords = result;
            console.log(coords);
            drawPath();
        });

    })
}

export {
    init,
    filterTool,
}