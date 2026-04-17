/**
 * graph.js
 * Generates a random directed graph representing web pages and their links.
 * Each page gets 1–(N-1) randomly chosen outgoing links to other pages.
 */

/**
 * Fisher-Yates shuffle — returns a new shuffled copy of the array.
 * @param {number[]} arr
 * @returns {number[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds an array of page objects with random outgoing link sets.
 * @param {number} numPages  Total number of pages (2–20)
 * @returns {{ id: number, links: number[], visits: number }[]}
 */
export function generateGraph(numPages) {
  return Array.from({ length: numPages }, (_, i) => {
    // Pool of valid targets: all pages except this one
    const pool = Array.from({ length: numPages }, (__, j) => j).filter(j => j !== i);

    // Random link count: 1 to pool.length
    const linkCount = Math.floor(Math.random() * pool.length) + 1;

    // Shuffle pool and take the first linkCount entries
    const links = shuffle(pool).slice(0, linkCount);

    return { id: i, links, visits: 0 };
  });
}
