import { openDB } from 'idb';

const Relations = {
    coordinates: "coordinates",
    accuracy: "accuracy"
};

/**
 * Opens or creates a database.
 * 
 * @returns {Promise<IDBPDatabase>?}
 */
const db = async () => {
    try {
        return await openDB('locator', 1, {
            upgrade(db) {
                const relations = Object.values(Relations);
                console.log(relations);
                for (const relation of relations) {
                    if (!db.objectStoreNames.contains(relation)) {
                        db.createObjectStore(relation, {
                            autoIncrement: true,
                        });
                    }
                }
            },
        });
    } catch (err) {
        console.error(err);
    }
};


/**
 * 
 * @param {import('ol/coordinate').Coordinate} coords 
 * @param {Object?} props - Key-value pairs to store with the coordinates.
 * @param {string?} table - The table to store the data in, defaults to "coordinates".
 */
const save = (coords, props = null, table = "coordinates") => {
    if (!coords) return;

    db().then((db) => {
        const tx = db.transaction(table, 'readwrite');
        tx.store.add({
            coords,
            timestamp: Date.now(),
            ...(props ? props : {}),
        });
        return tx.done;
    }).catch(console.error);
};

/**
 * @param {date} start
 * @param {date} end
 * @param {number?} limit
 * @param {number?} offset
 * 
 * @returns {Promise<import('ol/coordinate').Coordinate[]>}
 */
const get = async (start, end, limit = 100, offset = 0) => {
    try {
        let dbInstance = await db();
        if (!dbInstance) return [];

        const tx = dbInstance.transaction('coordinates', 'readonly');

        let cursor = await tx.store.openCursor();

        let coords = [];

        while (cursor) {
            if (cursor.value.timestamp >= start && cursor.value.timestamp <= end) {
                coords.push(cursor.value.coords);
            }
            cursor = await cursor.continue();
        }

        coords = coords.filter(Boolean);

        return coords.slice(offset, offset + limit);
    } catch (err) {
        console.error(err);
    }
}

export {
    save,
    get,
    Relations,
};