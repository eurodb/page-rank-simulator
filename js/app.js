/**
 * app.js
 * Entry point.  Wires controls, drives the requestAnimationFrame loop,
 * and coordinates graph.js / simulation.js / ui.js.
 */
import { generateGraph }           from './graph.js';
import { Simulation }              from './simulation.js';
import { renderLinksList }         from './ui.js';
import { GraphViz, PAGE_LABELS }   from './graph-viz.js';

// ── DOM refs ──────────────────────────────────────────────────
const numPagesInput  = document.getElementById('numPages');
const speedInput     = document.getElementById('speed');
const speedLabel     = document.getElementById('speedLabel');
const dampingInput   = document.getElementById('damping');
const dampingLabel   = document.getElementById('dampingLabel');
const generateBtn    = document.getElementById('generateBtn');
const runBtn         = document.getElementById('runBtn');
const stopBtn        = document.getElementById('stopBtn');
const resetBtn       = document.getElementById('resetBtn');
const graphVizEl     = document.getElementById('graphViz');
const stepCountEl    = document.getElementById('stepCount');
const currentPageEl  = document.getElementById('currentPage');
const dampingDisplay = document.getElementById('dampingDisplay');
const statsSection   = document.getElementById('stats');
const legendSection  = document.getElementById('legend');
const linksListEl    = document.getElementById('linksList');

// ── State ─────────────────────────────────────────────────────
let pages    = null;
let sim      = null;
let graphViz = null;
let rafId    = null;
let lastTime = 0;         // timestamp of last committed step

// ── Control helpers ───────────────────────────────────────────
function getDamping() { return parseInt(dampingInput.value) / 100; }
function getSpeed()   { return parseInt(speedInput.value); }

function setRunning(running) {
  runBtn.disabled  =  running;
  stopBtn.disabled = !running;
}

// ── Slider labels ─────────────────────────────────────────────
speedInput.addEventListener('input', () => {
  const v = getSpeed();
  speedLabel.textContent = `${v} step${v !== 1 ? 's' : ''}/sec`;
});

dampingInput.addEventListener('input', () => {
  const d = getDamping().toFixed(2);
  dampingLabel.textContent   = d;
  dampingDisplay.textContent = d;
  if (sim) sim.dampingFactor = getDamping();
});

// ── Generate ──────────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  try {
    const n = parseInt(numPagesInput.value);
    if (isNaN(n) || n < 2 || n > 20) return;

    stopLoop();

    pages    = generateGraph(n);
    sim      = new Simulation(pages, getDamping());

    graphViz = new GraphViz(graphVizEl, pages);
    graphViz.init();
    graphVizEl.style.display = 'block';
    renderLinksList(pages, linksListEl);

    statsSection.style.display  = 'flex';
    legendSection.style.display = 'block';
    stepCountEl.textContent   = '0';
    currentPageEl.textContent = '—';

    runBtn.disabled   = false;
    stopBtn.disabled  = true;
    resetBtn.disabled = false;
  } catch (err) {
    console.error('Generate failed:', err);
  }
});

// ── Run ───────────────────────────────────────────────────────
runBtn.addEventListener('click', () => {
  setRunning(true);
  lastTime = performance.now();
  rafId = requestAnimationFrame(tick);
});

// ── Stop ──────────────────────────────────────────────────────
stopBtn.addEventListener('click', () => {
  stopLoop();
  setRunning(false);
});

// ── Reset ─────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  stopLoop();
  if (!sim) return;

  sim.reset();
  graphViz.init();
  stepCountEl.textContent   = '0';
  currentPageEl.textContent = '—';
  setRunning(false);
  runBtn.disabled = false;
});

// ── Animation loop ────────────────────────────────────────────
function tick(timestamp) {
  const msPerStep = 1000 / getSpeed();

  // How many steps should have happened since lastTime?
  const elapsed      = timestamp - lastTime;
  const stepsNeeded  = Math.floor(elapsed / msPerStep);

  if (stepsNeeded > 0) {
    const stepsToRun = Math.min(stepsNeeded, 60);
    let lastVisited = null;
    let actualFrom  = null;

    for (let i = 0; i < stepsToRun; i++) {
      actualFrom  = sim.currentPage;   // capture who we're leaving
      lastVisited = sim.step();
    }

    lastTime += stepsToRun * msPerStep;

    graphViz.update(pages, actualFrom, lastVisited);

    stepCountEl.textContent   = sim.steps.toLocaleString();
    currentPageEl.textContent = `Page ${PAGE_LABELS[lastVisited]}`;
  }

  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

