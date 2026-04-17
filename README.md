# PageRank Simulator

An interactive Monte Carlo simulation that demonstrates how Google's early **PageRank algorithm** worked, built with vanilla HTML, CSS, and JavaScript (ES modules — no build step required).

---

## What it simulates

PageRank models the web as a directed graph. A hypothetical **random surfer** browses pages by:

- Following a random outgoing link with probability **d** (the *damping factor*, default 0.85)
- Teleporting to any random page with probability **1 − d**

After many steps the surfer's visit frequency converges to the **PageRank distribution** — pages linked-to more often (and from more important pages) accumulate higher scores. This project runs that process visually in real time.

---

## Features

- **Random graph generation** — each page gets 1–(N−1) randomly chosen outgoing links
- **Live SVG network graph** — nodes arranged in a circle with curved directed arrows
- **Transition probability labels** on every edge (1 / out-degree)
- **Yellow active-edge animation** — highlights the edge traversed on each step
- **Blue flash pulse** on the visited node each step
- **Green border** on the current surfer position
- **Live visit counts & percentages** inside each node, converging to PageRank values
- **Adjustable speed** (1–60 steps / sec) and **damping factor** (0.00–1.00) in real time
- **Reset** without regenerating the graph

---

## Project structure

```
Page Rank Simulator/
├── index.html          Main HTML shell
├── css/
│   └── style.css       Dark theme + SVG styles + animations
└── js/
    ├── app.js          Entry point — event wiring & rAF animation loop
    ├── graph.js        Random directed graph generation (Fisher-Yates)
    ├── simulation.js   Monte Carlo random-surfer engine
    ├── graph-viz.js    SVG network graph visualisation
    └── ui.js           Link-structure legend renderer
```

---

## Running locally

Because the project uses ES modules, it must be served over HTTP (not opened directly as a `file://` URL).

**Python (recommended):**
```bash
python -m http.server 8080 --directory "Page Rank Simulator"
# then open http://localhost:8080
```

**Node / npx:**
```bash
npx serve "Page Rank Simulator"
```

---

## How to use

1. Set the **number of pages** (2–20)
2. Click **Generate Pages** — the random graph appears
3. Adjust **Speed** and **Damping factor** as desired
4. Click **▶ Run** — the simulation starts
5. Watch visit counts accumulate; they converge to the theoretical PageRank vector
6. Click **■ Stop** / **↺ Reset** at any time

---

## Key concepts

| Term | Meaning |
|---|---|
| **Damping factor (d)** | Probability the surfer follows a link (0.85 is Google's original value) |
| **Teleportation** | With probability 1−d the surfer jumps to any page uniformly at random |
| **Transition probability** | 1 / (number of outgoing links) — shown on each arrow |
| **PageRank** | Stationary distribution of the Markov chain; approximated by visit frequency |

---

## Tech stack

- Vanilla **HTML5 / CSS3 / JavaScript** (ES2020 modules)
- **SVG** for the network graph (no canvas, no external library)
- Python `http.server` for local development

---

*Built as an educational tool to illustrate early Google PageRank using Markov chain Monte Carlo simulation.*
