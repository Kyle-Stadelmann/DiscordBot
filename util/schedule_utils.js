const fs = require('fs')

// Loads all schedules (used in the schedule command) from disk into memory
// Input: Discord client to attach the schedules to.
// Output: Bool of whether or not this was successful.
module.exports.load_schedules = (bot) => {
    // Read file in with 'a+'; meaning we read file in but create it if it doesn't exist
    let schedule_json = JSON.parse(fs.readFileSync('../database/schedules.json'), 'a+')
}

// Checks if the time on a schedule has been reached
// (this is supposed to be called every minute)
module.exports.check_schedules = () => {

}