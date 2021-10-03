module.exports = async (bot, oldPresence, newPresence) => {
    //console.log("Test")
    //await bot.util.sleep(1000)
    console.log(`old: ${oldPresence} , new: ${newPresence}`);
    console.log("old: " + JSON.stringify(oldPresence) + ", new: " + JSON.stringify(newPresence));

    console.log(oldPresence === null || newPresence === null ||
        oldPresence.guild.id !== bot.constants.BD5_ID || 
        newPresence.guild.id !== bot.constants.BD5_ID)
    if (oldPresence === null || newPresence === null ||
        oldPresence.guild.id !== bot.constants.BD5_ID || 
        newPresence.guild.id !== bot.constants.BD5_ID) return;

    console.log("old2: " + oldPresence.status + " , new2: " + newPresence.status)

}