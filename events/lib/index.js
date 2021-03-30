const fs = require('fs');

module.exports = (bot) => {
    const libDir = process.cwd() + "/events/lib/";
    let libFiles = fs.readdirSync(libDir);
    let libDirs = libFiles.filter((file) => fs.lstatSync(libDir + file).isDirectory());

    let libs = {};
    libDirs.forEach((dir) => {
        let thisEventLibs = {};

        // Bind all event helpers for this event to thisEventLibs
        fs.readdir(process.cwd() + `/events/lib/${dir}`, (err, files) => {
            if (err) return console.error(err);

            let jsfiles = files.filter(f => f.split(".").pop() === "js");
            if (jsfiles.length === 0) {
                console.log(`No ${dir} event helpers to load!`);
                return;
            }

            console.log(`Loading ${jsfiles.length} ${dir} event helpers...`);

            jsfiles.forEach((f, i) => {
                // Load event helper file
                let props = require(process.cwd() + `/events/lib/${dir}/${f}`);

                console.log(`${i + 1}: ${f} loaded!`);
                thisEventLibs[f] = props;
            });
            bot.printSpace();
        });

        // Bind event (with all the event helpers inside) to libs
        libs[dir] = thisEventLibs;
    });

    return libs;
}