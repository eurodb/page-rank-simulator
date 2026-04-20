/**
 * analysis.js
 * Graph analysis helpers for the PageRank simulator.
 */

/**
 * Finds all Strongly Connected Components using Tarjan's algorithm.
 * @param {{ id: number, links: number[] }[]} pages
 * @returns {number[][]}  Array of SCCs, each an array of page IDs.
 */
function tarjanSCC(pages) {
  const n       = pages.length;
  const index   = new Array(n).fill(-1);
  const lowlink = new Array(n).fill(0);
  const onStack = new Array(n).fill(false);
  const stack   = [];
  const sccs    = [];
  let   idx     = 0;

  function visit(v) {
    index[v] = lowlink[v] = idx++;
    stack.push(v);
    onStack[v] = true;

    for (const w of pages[v].links) {
      if (index[w] === -1) {
        visit(w);
        lowlink[v] = Math.min(lowlink[v], lowlink[w]);
      } else if (onStack[w]) {
        lowlink[v] = Math.min(lowlink[v], index[w]);
      }
    }

    // Root of an SCC — pop it off the stack
    if (lowlink[v] === index[v]) {
      const scc = [];
      let w;
      do { w = stack.pop(); onStack[w] = false; scc.push(w); } while (w !== v);
      sccs.push(scc);
    }
  }

  for (let v = 0; v < n; v++) {
    if (index[v] === -1) visit(v);
  }
  return sccs;
}

/**
 * Detects rank sink groups: SCCs whose members link exclusively
 * to each other, trapping the random surfer without teleportation.
 *
 * Uses Tarjan's SCC algorithm to find Strongly Connected Components,
 * then identifies components with no outgoing edges to other components.
 *
 * @param {{ id: number, links: number[] }[]} pages
 * @returns {number[]}  Sorted page IDs forming the sink, or [] if none.
 */
export function detectRankSinks(pages) {
  const n    = pages.length;
  const sccs = tarjanSCC(pages);
  const sink = [];

  for (const scc of sccs) {
    if (scc.length === n) continue;          // whole graph in one SCC — no sink
    const sccSet       = new Set(scc);
    const hasExit      = scc.some(v => pages[v].links.some(w => !sccSet.has(w)));
    if (!hasExit) sink.push(...scc);         // no link leaves this SCC → rank sink
  }

  return sink.sort((a, b) => a - b);
}
