const fs = require("fs");

module.exports = (bot) => {
	let libFiles = fs.readdirSync(__dirname);
	let libDirs = libFiles.filter((file) => fs.lstatSync(`${__dirname}/${file}`).isDirectory());

	let libs = {};
	libDirs.forEach((dir) => {
		let thisEventLibs = {};

		// Bind all event helpers for this event to thisEventLibs
		fs.readdir(`${__dirname}/${dir}`, (err, files) => {
			if (err) return console.error(err);

			let jsfiles = files.filter((f) => f.split(".").pop() === "js");
			if (jsfiles.length === 0) {
				console.log(`No ${dir} event helpers to load!`);
				return;
			}

			console.log(`Loading ${jsfiles.length} ${dir} event helpers...`);

			jsfiles.forEach((f, i) => {
				// Load event helper file
				let props = require(`${__dirname}/${dir}/${f}`);

				console.log(`${i + 1}: ${f} loaded!`);
				thisEventLibs[f] = props;
			});
			bot.printSpace();
		});

		// Bind event (with all the event helpers inside) to libs
		libs[dir] = thisEventLibs;
	});

	return libs;
};
