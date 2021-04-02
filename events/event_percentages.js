// Defines the percentages of each created random event

module.exports = {
    KHANG_NEKO_CHANCE: 5,
    DANIEL_SUCCESS_MOVE_CHANCE: 50,
    HEAVY_DOLLAR_SIGN_CHANCE: .5,
    DANIEL_WPM_CHANCE_FUNCTION: daniel_wpm_chance_function,
    QUESTION_MARK_CHANCE: 5,
    EPIC_SUNGLASSES_CHANCE: 100,
    SUNGLASSES_EPIC_CHANCE: 100,
    ZACC_CHANCE: 5,
    MUTE_CHANCE: .1,
}

function daniel_wpm_chance_function(numWords) {
    const MIN_WORDS = 3;
    const MAX_CHANCE = 15;

    // if not enough words, chance is 0%
    if (numWords < MIN_WORDS) return 0;

    // chance equation (exponential)
    let chance = Math.pow(numWords,1.7)*0.2;
    if (chance > MAX_CHANCE) chance = MAX_CHANCE;

    return chance;
}