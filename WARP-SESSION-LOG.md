# Warp Session Log — PageRank Simulator
**Date:** 17–20 April 2026  
**Repository:** https://github.com/eurodb/page-rank-simulator  
**Branch:** `master` (+ `feature/rank-sink-detection` PR)

---

## Overview

Built a complete, zero-dependency PageRank Simulator from scratch — an interactive Monte Carlo simulation demonstrating how Google's early PageRank algorithm worked, with a live SVG network graph, animated random-surfer walk, and automatic educational analysis.

---

## Session Timeline

### 1. Project setup
- Created `/c/Users/eurod/Warp-Projects/Page Rank Simulator/` directory
- Initialised the modular file structure:
  ```
  index.html
  css/style.css
  js/app.js
  js/graph.js
  js/simulation.js
  js/ui.js
  ```

### 2. Core simulation engine
**`js/graph.js`**
- Generates a random directed graph of N pages (2–20)
- Each page assigned 1–(N−1) random outgoing links using Fisher-Yates shuffle
- No self-links guaranteed

**`js/simulation.js`**
- Monte Carlo random-surfer model
- At each step: follow a random link with probability `d` (damping factor) or teleport to any random page with probability `1−d`
- Configurable damping factor, live-updatable mid-simulation
- `reset()` clears all visit counts without regenerating the graph

### 3. Initial UI — page boxes
**`js/ui.js`** + **`css/style.css`**
- Dark GitHub-style theme (`#0d1117` background)
- CSS Grid of page boxes showing visit count, percentage, and outgoing links
- Flash animation on visit (`@keyframes pageFlash`)
- Glow intensity scaled to visit frequency via CSS custom property `--intensity`

### 4. Bug fix — stats bar visible before generate
- **Root cause:** CSS `display: flex` on `.stats` overrode the HTML `hidden` attribute
- **Fix:** Replaced `hidden` attribute with explicit `style="display:none"` in HTML and `element.style.display` toggling in JS

### 5. SVG network graph visualisation
Added **`js/graph-viz.js`** — the primary visual output, replacing the page-box grid:
- Circular node layout (radius adapts to N)
- Quadratic Bézier curved edges — bidirectional edges curve to opposite sides to avoid overlap
- SVG `<marker>` arrowheads (blue for inactive, yellow for active)
- Transition probability labels on every edge (`1 / out-degree`)
- **Yellow flowing-dash animation** on the traversed edge each step (`stroke-dasharray` + `@keyframes dashFlow`)
- **Blue flash pulse** on visited node (`@keyframes nodeFlash` with `drop-shadow` filter)
- **Green border** on current surfer position
- Live visit counts and percentages inside each SVG node
- `PAGE_LABELS` export maps page indices to letters A–T

**`js/app.js`** refactored to:
- Import and instantiate `GraphViz`
- Track `actualFrom` (page left before `sim.step()`) for correct edge highlighting in batched frames
- Display current page as letter (e.g. "Page C") using `PAGE_LABELS`
- `requestAnimationFrame` loop with speed-capped batching (max 60 steps/frame)

### 6. Bug fix — Generate Pages not working
- **Root cause:** Stale `prevPage = null` left in the generate handler after `prevPage` variable was removed during the GraphViz refactor → `ReferenceError` silently aborted the click handler
- **Detection:** Added `window.onerror` global handler + `try/catch` in the click handler to surface the error as an alert
- **Fix:** Removed the orphaned `prevPage = null` line; cleaned up debug code afterwards

### 7. Python HTTP server
- ES modules require HTTP serving (blocked on `file://` by Chrome/Edge)
- Started `python -m http.server 8080` with a custom `NoCacheHandler` (`Cache-Control: no-store`) to prevent browser caching issues during development

### 8. Rank sink detection — new feature
**`js/analysis.js`** (new module):

*First attempt* — iterative candidate-set removal:
- Repeatedly removed pages with outgoing links leaving the candidate set
- **Failed:** couldn't distinguish a real sink (C↔D) from a graph where all pages happen to have internal links

*Correct implementation* — **Tarjan's SCC algorithm:**
- Finds all Strongly Connected Components in O(V + E)
- A sink SCC = an SCC with no outgoing edges to other SCCs
- Correctly handles: 2-node mutual sinks, N-node clusters, multiple separate sinks, whole-graph cycles (not a sink), and fully connected graphs

**`index.html`** — amber warning panel:
- Hidden by default; shown automatically after each Generate Pages if a sink is detected
- Names the trapped pages by letter (e.g. "Pages C & D")
- Explains the rank sink phenomenon in plain language
- Dismissable via ✕ button

**`css/style.css`** — sink panel styles:
- Amber-tinted card (`rgba(251,188,5,0.07)` background, amber border)
- ⚠ icon, dismiss button with hover state

**`js/app.js`** — calls `detectRankSinks(pages)` after each graph generation; shows/hides panel

**Verification — 8 unit tests, all passing:**

| Test | Graph | Expected | Result |
|------|-------|----------|--------|
| 1 | A→{B,C}, B→{A,D}, C→D, D→C | Sink: C & D | ✅ |
| 2 | Fully connected triangle | No sink | ✅ |
| 3 | A→B→C→A cycle fed by D | Sink: A, B, C | ✅ |
| 4 | Whole-graph A→B→C→A | No sink | ✅ |
| 5 | Two separate 2-node sinks + feeder | Sink: A, B, C, D | ✅ |

### 9. README.md
Wrote comprehensive project documentation covering:
- Background (1998 Page & Brin paper)
- How PageRank works (random surfer model, transition probability formula)
- Full features list
- Project structure with all 7 modules described
- Prerequisites and three setup options (Python, npx, VS Code Live Server)
- Usage guide table with tips
- Key concepts table (8 terms: PageRank, Damping factor, Teleportation, Transition probability, Markov chain, Stationary distribution, Monte Carlo, Convergence, Rank Sink, SCC)
- Tech stack table
- MIT licence

### 10. Git & GitHub
- Initialised local git repo; configured identity for `eurodb`
- 6 commits on `master`:
  ```
  96ee639  Initial commit: PageRank Simulator
  7adf06f  Add README.md with project documentation
  07e669b  Expand README with detailed description and setup instructions
  78d453b  Fix: remove stale prevPage reference that broke Generate Pages
  6fe1753  Add rank sink detection and contextual info panel
  920e63a  Fix rank sink detection with Tarjan SCC algorithm; update README
  ```
- Remote: `https://github.com/eurodb/page-rank-simulator.git`
- PR opened: `feature/rank-sink-detection` → `master`
  - URL: https://github.com/eurodb/page-rank-simulator/pull/new/feature/rank-sink-detection

---

## Final File Structure

```
Page Rank Simulator/
├── index.html              Controls, stats bar, sink panel, SVG container, legend
├── css/
│   └── style.css           Dark theme, SVG styles, flash/dash animations, sink panel
└── js/
    ├── app.js              Entry point — event wiring, rAF loop, sink detection call
    ├── graph.js            Random directed graph (Fisher-Yates shuffle)
    ├── simulation.js       Monte Carlo random-surfer, configurable damping
    ├── graph-viz.js        SVG network graph — Bézier edges, arrowheads, flash/glow
    ├── analysis.js         Tarjan SCC — rank sink detection
    └── ui.js               Link-structure legend renderer
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vanilla JS ES modules, no framework | No build step; works directly in Bolt.new and any HTTP server |
| SVG (not Canvas) for graph | CSS animations, DOM event handling, and styleable elements |
| Quadratic Bézier edges | Handles bidirectional edges cleanly; computable without a library |
| Tarjan's SCC over simpler heuristics | Correct for all graph topologies; O(V+E); educational value |
| `requestAnimationFrame` with batching | Smooth animation at all speeds (1–60 steps/sec) without jank |
| `Cache-Control: no-store` dev server | Prevented stale-cache debugging pain during iterative development |

---

*Session conducted in Warp with Oz AI agent.*  
*Co-Authored-By: Oz <oz-agent@warp.dev>*
