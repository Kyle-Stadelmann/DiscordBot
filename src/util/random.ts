// Random chance to return a true value
// Input: Percentage (can be non-int) of returning true.
// Output: returns true/false
export function random(chance: number) {
	return Math.random() * 100 <= chance;
}

export function getRandomElement<T>(arr: T[]): T | undefined {
	if (arr.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
}

export function getRandomElements<T>(arr: T[], count: number): T[] {
	if (count <= 0 || arr.length <= count) return arr;
	const result: T[] = [];
	const usedIndicies = new Set<number>();

	while (result.length < count) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		if (!usedIndicies.has(randomIndex)) {
			result.push(arr[randomIndex]);
			usedIndicies.add(randomIndex);
		}
	}
	return result;
}
