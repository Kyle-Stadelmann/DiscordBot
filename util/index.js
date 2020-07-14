// Our functions object that we are exporting
var functions = {};

// Load all our util functions into our bot.util collection
let files = require("fs").readdirSync("./util/");

//if (err) return console.error(`ERROR: ${err}`);

let jsfiles = files.filter(f => f.split(".").pop() === "js");

let index = jsfiles.indexOf("index.js");
if (index > -1) {
    jsfiles.splice(index, 1);
}

if (jsfiles.length <= 0) {
    return;
}

jsfiles.forEach((f, i) => {
    // Put our util function into our functions object
    let bufferFunction = (require(`./${f}`));
    let functionKey = Object.keys(bufferFunction)[0];
    let functionValue = Object.values(bufferFunction)[0];
    functions[`${functionKey}`] = functionValue;
});

// Export our functions
module.exports = functions;
