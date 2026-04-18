/**
 * analysis.js
 * Graph analysis helpers for the PageRank simulator.
 */

/**
 * Detects rank sink groups: sets of pages whose outgoing links
 * stay entirely within the group, trapping the random surfer in
 * a loop that can only be escaped via teleportation.
 *
 * Algorithm: iteratively remove any page that has at least one
 * outgoing link leaving the candidate set.  What remains is the
 * maximal sink — pages that link exclusively to other sink pages.
 *
 * @param {{ id: number, links: number[] }[]} pages
 * @returns {number[]}  Sorted page IDs forming the sink, or [] if none.
 */
export function detectRankSinks(pages) {
  const n         = pages.length;
  const candidate = new Set(Array.from({ length: n }, (_, i) => i));

  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...candidate]) {
      // If any outgoing link leaves the candidate set, this page is not a sink
      const hasExternalLink = pages[id].links.some(l => !candidate.has(l));
      if (hasExternalLink) {
        candidate.delete(id);
        changed = true;
      }
    }
  }

  // A non-trivial sink: some pages are trapped but not all
  return candidate.size > 0 && candidate.size < n
    ? [...candidate].sort((a, b) => a - b)
    : [];
}
