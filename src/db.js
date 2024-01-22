import { openDB } from 'idb';

/**
 * Opens or creates a database.
 * 
 * @returns {Promise<IDBPDatabase>?}
 */
const db = async () => {
    try {
        return await openDB('locator', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('coordinates')) {
                    db.createObjectStore('coordinates', {
                        autoIncrement: true,
                    });
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
 */
const save = (coords) => {
    if (!coords) return;

    db().then((db) => {
        const tx = db.transaction('coordinates', 'readwrite');
        tx.store.add({
            coords,
            timestamp: Date.now(),
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
};