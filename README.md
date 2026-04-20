# PageRank Simulator

> An interactive Monte Carlo simulation that demonstrates how **Google's early PageRank algorithm** worked — visualised as a live, animated network graph.
>
> Built with vanilla HTML, CSS, and JavaScript (ES modules). No framework, no build step, no dependencies.

---

## Background

In 1998, Larry Page and Sergey Brin published *"The Anatomy of a Large-Scale Hypertextual Web Search Engine"*, introducing **PageRank** — a way to score web pages by their importance based on the link structure of the entire web.

The core insight: a page is important if **many important pages link to it**. This is modelled mathematically as the **stationary distribution of a Markov chain** over the web graph, where a hypothetical *random surfer* wanders from page to page.

This project simulates that random surfer in real time and lets you watch the PageRank scores emerge from the noise.

---

## How PageRank works

The random surfer model defines the surfer's behaviour at each step:

1. With probability **d** (the *damping factor*), follow one of the current page's outgoing links at random.
2. With probability **1 − d**, teleport to any page on the web uniformly at random.

The teleportation step prevents the surfer from getting trapped on pages with no outgoing links (*dangling nodes*) and ensures the Markov chain has a unique stationary distribution.

After enough steps the fraction of time the surfer spends on each page converges to that page's **PageRank score**. Google's original damping factor was **d = 0.85**.

The transition probability along each link is:

```
P(i → j) = 1 / (number of outgoing links from page i)
```

---

## Features

- **Random graph generation** — each page is assigned 1–(N−1) randomly chosen outgoing links using a Fisher-Yates shuffle
- **Live SVG network graph** — nodes arranged in a circle with curved, directed arrows
- **Transition probability labels** on every edge showing the exact per-link probability
- **Yellow flowing-dash animation** on the active edge at each step
- **Blue flash pulse** on the visited node each step
- **Green border** tracking the current surfer position
- **Live visit counts and percentages** inside each node — watch them converge to the true PageRank values
- **Adjustable simulation speed** — 1 to 60 steps per second
- **Adjustable damping factor** — 0.00 to 1.00, updated live without stopping the simulation
- **Reset** clears visit counts without regenerating the graph, so you can re-run on the same topology
- **Link structure legend** below the graph showing every page's outgoing links
- **Rank Sink detector** — automatically identifies trapped page groups after each generation and displays a contextual warning panel explaining the phenomenon

---

## Project structure

```
Page Rank Simulator/
├── index.html              Main HTML shell — controls, stats bar, containers
├── css/
│   └── style.css           Dark GitHub-style theme, SVG node/edge styles, keyframe animations
└── js/
    ├── app.js              Entry point — DOM wiring, requestAnimationFrame loop
    ├── graph.js            Random directed graph generator (Fisher-Yates shuffle)
    ├── simulation.js       Monte Carlo random-surfer engine with configurable damping
    ├── graph-viz.js        SVG network graph — layout, edges, labels, flash & highlight
    ├── analysis.js         Graph analysis — Tarjan SCC algorithm for rank sink detection
    └── ui.js               Link-structure legend renderer
```

Each module has a single, clearly defined responsibility. No file exceeds ~150 lines.

---

## Prerequisites

- A modern browser (Chrome, Firefox, Edge, Safari — any that supports ES2020 modules)
- **Python 3** or **Node.js** to serve the files locally (required because ES modules are blocked on `file://` URLs by most browsers)

---

## Setup & running locally

### 1. Clone the repository

```bash
git clone https://github.com/eurodb/page-rank-simulator.git
cd page-rank-simulator
```

### 2. Start a local HTTP server

**Option A — Python 3 (recommended, no install needed):**
```bash
python -m http.server 8080
```

**Option B — Node.js / npx:**
```bash
npx serve .
```

**Option C — VS Code Live Server extension:**
Right-click `index.html` → *Open with Live Server*.

### 3. Open in your browser

```
http://localhost:8080
```

---

## Usage guide

| Step | Action | Result |
|------|--------|--------|
| 1 | Set **Pages** (2–20) | Choose graph size |
| 2 | Click **Generate Pages** | Random directed graph appears |
| 3 | Adjust **Speed** slider | 1–60 simulation steps per second |
| 4 | Adjust **Damping factor** slider | Changes surfer behaviour live |
| 5 | Click **▶ Run** | Simulation starts, nodes begin flashing |
| 6 | Watch nodes | Visit counts rise; percentages converge to PageRank |
| 7 | Click **■ Stop** | Pause at any time |
| 8 | Click **↺ Reset** | Clear counts, keep same graph, run again |
| 9 | Click **Generate Pages** again | New random graph |

**Tip:** Run at high speed (60 steps/sec) for fast convergence, then slow down to 1–2 steps/sec to follow individual transitions.

---

## Key concepts

| Term | Definition |
|------|------------|
| **PageRank** | A score (0–1) reflecting a page's relative importance; equals the stationary probability of the random surfer being on that page |
| **Damping factor (d)** | Probability the surfer follows a link rather than teleporting. Google's original value: **0.85** |
| **Teleportation** | With probability 1−d the surfer jumps to a uniformly random page — prevents sink traps |
| **Transition probability** | Probability of following a specific link = 1 / (out-degree of source page) |
| **Markov chain** | A memoryless random process; the next state depends only on the current state |
| **Stationary distribution** | The long-run fraction of time spent in each state — this is the PageRank vector |
| **Monte Carlo method** | Approximating a mathematical result (PageRank) by running many random experiments (surfer steps) |
| **Convergence** | As total steps → ∞, observed visit frequencies → true PageRank values |
| **Rank Sink** | A group of pages whose outgoing links stay entirely within the group. The random surfer loops inside indefinitely without teleportation, causing those pages to accumulate disproportionately high PageRank. Detected automatically using Tarjan's SCC algorithm |
| **SCC (Strongly Connected Component)** | A maximal set of nodes where every node is reachable from every other. A sink SCC has no outgoing edges to other SCCs |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, keyframe animations, CSS Grid) |
| Logic | JavaScript ES2020 (ES modules, classes, `requestAnimationFrame`) |
| Graph rendering | Inline SVG (quadratic Bézier paths, SVG markers for arrowheads) |
| Dev server | Python 3 `http.server` |
| Version control | Git / GitHub |

No npm, no webpack, no framework — the entire app is plain files you can read and modify directly.

---

## Licence

MIT — free to use, modify, and distribute.

---

*Built as an educational tool to illustrate early Google PageRank using Markov chain Monte Carlo simulation.*
