// Random chance to return a true value
// Input: Percentage (can be non-int) of returning true.
// Output: returns true/false
module.exports.random = (chance) => {
    let numerator = chance;
    // Default val is 100 assuming we are using int percentages
    let denominator = 100;

    // Convert our numerator into an int
    // while doing so, also raise the denominator
    while (numerator % 1 != 0) {
        denominator *= 10;
        numerator *= 10;
    }

    // Random num (0, denominator]
    const randomVal = Math.random() * denominator;
    if (randomVal <= numerator) {
        return true;
    } else {
        return false;
    }
}
