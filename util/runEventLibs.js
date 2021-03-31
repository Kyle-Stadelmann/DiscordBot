// Runs all the libs/helpers for a certain event.
// Input: Bot client (that has the lib functions we will run), the eventName
// that we are running the helper functions for, and the options array that we
// will take and pass in each argument of.
module.exports.runEventLibs = (bot, eventName, opts) => {
    const eventLibs = bot.events_lib[eventName];
    for (const eventLib in eventLibs) {
        const eventLibFunc = eventLibs[eventLib];
        // Bind bot to the function call, such that if we call this function call,
        // bot will automatically be included as an argument
        let bindedFunc = eventLibFunc.bind(null, bot);

        // Now bind the rest of the options
        opts.forEach((opt) => {
            bindedFunc = bindedFunc.bind(null, opt);
        });
        // Call the function after all its arguments have been binded
        bindedFunc();
    }
}
