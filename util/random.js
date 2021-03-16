// Random chance to return a true value
// Input: Percentage (can be non-int) of returning true.
// Output: returns true/false
module.exports.random = (chance) => {

    let ourChance = chance;
    // Default val is 100 assuming we are using int percentages
    let possibilities = 100;

    // Convert our number into an int
    while (ourChance % 1 != 0) {
        possibilities *= 10;
        ourChance *= 10;
    }

    // Random num from 1 to possibilities
    randomVal = (Math.random() * possibilities) + 1;
    if (randomVal <= ourChance) {
        return true;
    } else {
        return false;
    }
}
