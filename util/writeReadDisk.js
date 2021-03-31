const fs = require('fs');
const { Collection } = require("discord.js");
const v8 = require('v8');
const path = require('path');

// To eliminate race conditions when writing/reading to a file that is currently being
// written/read from. Why doesn't node do this....
let mutex = new Collection();

// Writes some data of any type (Object, Map, Collection, etc.) to the file that corresponds
// to the filePath.
// Input: Data to write, filePath to write to
module.exports.writeDisk = async (bot, data, filePath) => {
    // Gets a deep copy of our data, but Collections will be converted to Maps
    // This is important as JSON.stringify doesn't support Collections but it does support Maps
    let dataCopy = v8.deserialize(v8.serialize(data));
    let dataStr = JSON.stringify(dataCopy, replacer);
    let dirPath = path.parse(filePath).dir;

    fs.access(dirPath, fs.constants.F_OK, async (err) => {
        // if err, that means we need to create the directory/file structure
        if (err) {
            await fs.mkdir(dirPath, {recursive: true}, (err) => {
                if (err) console.error(err);
            });
        }

        while (mutex.has(filePath)) {
            await bot.util.sleep(250);
        }
        mutex.set(filePath, true);
        fs.writeFile(filePath, dataStr, (err) => {
            mutex.delete(filePath);
            if (err) console.error(err);
        });
    });
}

// Reads data of any type (Object, Map, Collection, etc.) to the file that corresponds
// to the fileName and returns it.
// Input: fileName to read from, callback function to call on the err and data we'll get from
// reading or parsing.
module.exports.readDisk = async (bot, fileName, callback) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) { 
            callback(err);
            return;
        }

        try {
            // Parses the read in data using the reviver to restore the maps
            callback(null, JSON.parse(data, reviver));
        } catch (err) {
            // If the file couldn't be parsed as JSON, pass err into the callback
            callback(err);
        }
    });
}

// Used in JSON.stringify to replace Maps with objects for storing as JSON
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: [...value],
        };
    } else {
        return value;
    }
}

// Used in JSON.parse to revive/restore the Maps we stored as objects in JSON
function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Collection(value.value);
        }
    }
    return value;
}