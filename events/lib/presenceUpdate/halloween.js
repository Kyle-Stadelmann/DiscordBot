module.exports = async (bot, oldPresence, newPresence) => {
    if (!oldPresence || !newPresence) return;
    if (oldPresence.guild.id !== bot.constants.DEV_SERVER_ID || 
        newPresence.guild.id !== bot.constants.DEV_SERVER_ID) return;
    // Only activate in October
    if (new Date().getMonth() !== 9) return;
    // Only activate if user went from an offline->online or an online->offline state
    // meaning, either old or new presence needs to be offline, but the other can't be as well
    if ((oldPresence.status === "offline") === (newPresence.status === "offline")) return;
    //console.log("test")
}