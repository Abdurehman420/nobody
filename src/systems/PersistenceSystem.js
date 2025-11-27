import LZString from 'lz-string';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'void_gamestate_hot';
const SAVE_VERSION = '1.4.2';

// Simple CRC32 implementation for checksums
const crc32 = (str) => {
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ TABLE[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};

// Precompute CRC32 table
const TABLE = (() => {
    const t = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        t[i] = c;
    }
    return t;
})();

export const PersistenceSystem = {
    /**
     * Serializes and saves the current game state to LocalStorage.
     * @param {Object} state - The current GameContext state.
     */
    save: (state) => {
        try {
            const snapshot = {
                meta: {
                    version: SAVE_VERSION,
                    timestamp: Date.now(),
                    save_id: uuidv4(),
                    playtime_seconds: state.tick / 60, // Approx
                },
                data: state // Save the entire state for simplicity and completeness
            };

            const jsonString = JSON.stringify(snapshot);
            const compressed = LZString.compressToUTF16(jsonString);

            localStorage.setItem(STORAGE_KEY, compressed);

            // Update cookie for "Session Meta" (as per design doc)
            document.cookie = `void_last_save=${Date.now()}; path=/; secure; samesite=strict`;

            // console.log(`[Chronos] Game saved. Size: ${(compressed.length / 1024).toFixed(2)}KB`);
            return true;
        } catch (error) {
            console.error('[Chronos] Save failed:', error);
            return false;
        }
    },

    /**
     * Loads the game state from LocalStorage.
     * @returns {Object|null} The deserialized state or null if not found/invalid.
     */
    load: () => {
        try {
            const compressed = localStorage.getItem(STORAGE_KEY);
            if (!compressed) return null;

            const jsonString = LZString.decompressFromUTF16(compressed);
            if (!jsonString) {
                console.error('[Chronos] Decompression failed.');
                return null;
            }

            const snapshot = JSON.parse(jsonString);

            // Version check (optional, could migrate here)
            if (snapshot.meta.version !== SAVE_VERSION) {
                console.warn(`[Chronos] Version mismatch. Save: ${snapshot.meta.version}, Current: ${SAVE_VERSION}`);
                // For now, we assume backward compatibility or just load it.
            }

            // console.log(`[Chronos] Game loaded. Timestamp: ${new Date(snapshot.meta.timestamp).toLocaleString()}`);
            return snapshot.data;
        } catch (error) {
            console.error('[Chronos] Load failed:', error);
            return null;
        }
    },

    /**
     * Exports the save to a Base64 string for sharing.
     * Format: VOID_SAVE_v1::<CompressedBase64String>::<Checksum>
     * @param {Object} state 
     * @returns {string} The export string.
     */
    exportToString: (state) => {
        const snapshot = {
            meta: {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                save_id: uuidv4(),
            },
            data: state
        };
        const jsonString = JSON.stringify(snapshot);
        const compressed = LZString.compressToBase64(jsonString);
        const checksum = crc32(compressed).toString(16);

        return `VOID_SAVE_v1::${compressed}::${checksum}`;
    },

    /**
     * Imports a save from a Base64 string.
     * @param {string} saveString 
     * @returns {Object|null} The state object or null if invalid.
     */
    importFromString: (saveString) => {
        try {
            const parts = saveString.split('::');
            if (parts.length !== 3) throw new Error("Invalid format");

            const [header, compressed, checksum] = parts;

            if (header !== 'VOID_SAVE_v1') throw new Error("Invalid header");

            const calculatedChecksum = crc32(compressed).toString(16);
            if (calculatedChecksum !== checksum) throw new Error("Checksum mismatch");

            const jsonString = LZString.decompressFromBase64(compressed);
            if (!jsonString) throw new Error("Decompression failed");

            const snapshot = JSON.parse(jsonString);
            return snapshot.data;
        } catch (error) {
            console.error('[Chronos] Import failed:', error);
            return null;
        }
    },

    /**
     * Imports a save from a JSON string (e.g. from .void file).
     * @param {string} jsonString 
     * @returns {Object|null} The state object or null if invalid.
     */
    importFromJSON: (jsonString) => {
        try {
            const snapshot = JSON.parse(jsonString);
            if (!snapshot.meta || !snapshot.data) throw new Error("Invalid JSON structure");
            return snapshot.data;
        } catch (error) {
            console.error('[Chronos] JSON Import failed:', error);
            return null;
        }
    },

    /**
     * Downloads the save as a .void file.
     * @param {Object} state 
     */
    downloadFile: (state) => {
        const snapshot = {
            meta: {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                save_id: uuidv4(),
            },
            data: state
        };
        const data = JSON.stringify(snapshot, null, 2); // Pretty print for .void file
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `save_${Date.now()}.void`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Clears the local save.
     */
    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Chronos] Save cleared.');
    }
};
