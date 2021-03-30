// Our functions object that we are exporting
var functions = {};

// Load all our util functions into our bot.util collection
let files = require("fs").readdirSync(process.cwd() + "/util/");

//if (err) return console.error(`ERROR: ${err}`);

let jsfiles = files.filter(f => f.split(".").pop() === "js");

let index = jsfiles.indexOf("index.js");
if (index > -1) {
    jsfiles.splice(index, 1);
}

if (jsfiles.length <= 0) {
    return;
}

jsfiles.forEach((f) => {
    // Put our util function into our functions object
    let bufferFunction = (require(`./${f}`));

    let functionKeys = Object.keys(bufferFunction);
    let functionValues = Object.values(bufferFunction);

    for (i=0; i<functionKeys.length; i++) {
        functions[`${functionKeys[i]}`] = functionValues[i];
    }
});

// Export our functions
module.exports = functions;