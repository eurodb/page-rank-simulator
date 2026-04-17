/**
 * simulation.js
 * Monte Carlo random-surfer model (classic PageRank).
 *
 * At each step the surfer either:
 *   – follows a random outgoing link  (probability = dampingFactor), or
 *   – teleports to any random page    (probability = 1 - dampingFactor)
 *
 * The long-run visit frequency converges to the PageRank vector.
 */
export class Simulation {
  /**
   * @param {{ id: number, links: number[], visits: number }[]} pages
   * @param {number} dampingFactor  0–1, default 0.85
   */
  constructor(pages, dampingFactor = 0.85) {
    this.pages        = pages;
    this.numPages     = pages.length;
    this.dampingFactor = dampingFactor;
    this.steps        = 0;
    this.currentPage  = Math.floor(Math.random() * this.numPages);
  }

  /**
   * Advance the surfer one step.
   * @returns {number}  Index of the page that was landed on.
   */
  step() {
    const links = this.pages[this.currentPage].links;
    let next;

    if (links.length > 0 && Math.random() < this.dampingFactor) {
      // Follow a random outgoing link
      next = links[Math.floor(Math.random() * links.length)];
    } else {
      // Teleport to a uniformly random page
      next = Math.floor(Math.random() * this.numPages);
    }

    this.currentPage = next;
    this.pages[next].visits++;
    this.steps++;
    return next;
  }

  /** Total visits recorded across all pages. */
  get totalVisits() {
    return this.pages.reduce((sum, p) => sum + p.visits, 0);
  }

  /** Reset visit counts and start position without re-generating the graph. */
  reset() {
    this.pages.forEach(p => { p.visits = 0; });
    this.currentPage = Math.floor(Math.random() * this.numPages);
    this.steps       = 0;
  }
}
