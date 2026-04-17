/**
 * graph-viz.js
 * SVG network graph: nodes in a circular layout, curved directed edges
 * with transition-probability labels, live visit counts, and step animation.
 */

export const PAGE_LABELS = 'ABCDEFGHIJKLMNOPQRST';

const BOX_W  = 112;
const BOX_H  = 72;
const BOX_RX = 10;
const NODE_R = 50;   // approx radius for edge attachment point

export class GraphViz {
  /**
   * @param {HTMLElement} container
   * @param {{ id: number, links: number[] }[]} pages
   */
  constructor(container, pages) {
    this.container = container;
    this.pages     = pages;
    this.n         = pages.length;
    this.svg       = null;
    this.positions = [];
    this.nodeEls   = {};   // id → { g, rect, countEl, pctEl }
    this.edgeEls   = {};   // "i-j" → { path, lbl }
    this.activeKey = null;

    this._edgeSet = new Set();
    pages.forEach(p => p.links.forEach(t => this._edgeSet.add(`${p.id}-${t}`)));
  }

  // ── Geometry helpers ──────────────────────────────────────────

  _computePositions() {
    const W = 700, H = 500;
    const cx = W / 2, cy = H / 2;
    const r  = this.n <= 4  ? 150
             : this.n <= 8  ? 185
             : this.n <= 12 ? 205
             :                220;
    this.viewW     = W;
    this.viewH     = H;
    this.positions = Array.from({ length: this.n }, (_, i) => ({
      x: cx + r * Math.cos(2 * Math.PI * i / this.n - Math.PI / 2),
      y: cy + r * Math.sin(2 * Math.PI * i / this.n - Math.PI / 2),
    }));
  }

  _hasBoth(i, j) {
    return this._edgeSet.has(`${i}-${j}`) && this._edgeSet.has(`${j}-${i}`);
  }

  /** Compute quadratic bezier control + attachment points for an edge. */
  _curveData(fromId, toId) {
    const f      = this.positions[fromId];
    const t      = this.positions[toId];
    const bidir  = this._hasBoth(fromId, toId);
    const offset = bidir ? 52 : 16;

    const dx  = t.x - f.x, dy = t.y - f.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx  = -dy / len, ny = dx / len;   // left-perpendicular

    // Control point
    const cpx = (f.x + t.x) / 2 + nx * offset;
    const cpy = (f.y + t.y) / 2 + ny * offset;

    // Start: from-node edge toward control point
    const sfx = cpx - f.x, sfy = cpy - f.y;
    const sfl = Math.hypot(sfx, sfy) || 1;
    const sx  = f.x + sfx / sfl * NODE_R;
    const sy  = f.y + sfy / sfl * NODE_R;

    // End: to-node edge toward control point (+7 for arrowhead clearance)
    const efx = cpx - t.x, efy = cpy - t.y;
    const efl = Math.hypot(efx, efy) || 1;
    const ex  = t.x + efx / efl * (NODE_R + 7);
    const ey  = t.y + efy / efl * (NODE_R + 7);

    // Label: bezier midpoint pushed toward control point
    const mx  = 0.25 * sx + 0.5 * cpx + 0.25 * ex;
    const my  = 0.25 * sy + 0.5 * cpy + 0.25 * ey;
    const tlx = cpx - mx, tly = cpy - my;
    const tll = Math.hypot(tlx, tly) || 1;
    const lx  = mx + tlx / tll * 14;
    const ly  = my + tly / tll * 14;

    return { sx, sy, cpx, cpy, ex, ey, lx, ly };
  }

  /** Probability of each outgoing link from a page. */
  _prob(fromId) {
    const k = this.pages[fromId].links.length;
    return k ? `${(100 / k).toFixed(1)}%` : '0%';
  }

  // ── SVG construction ──────────────────────────────────────────

  init() {
    this._computePositions();
    this.container.innerHTML = '';
    this.nodeEls   = {};
    this.edgeEls   = {};
    this.activeKey = null;

    const NS  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.viewW} ${this.viewH}`);
    svg.classList.add('graph-svg');
    this.svg = svg;

    // Arrowhead markers
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = `
      <marker id="arr-blue" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,1 L9,5 L0,9 z" fill="#3a7bd5" opacity="0.8"/>
      </marker>
      <marker id="arr-yellow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,1 L9,5 L0,9 z" fill="#fbbc05"/>
      </marker>`;
    svg.appendChild(defs);

    const edgeLayer = document.createElementNS(NS, 'g');
    const nodeLayer = document.createElementNS(NS, 'g');

    // ── Edges ────────────────────────────────────────────────────
    this.pages.forEach(page => {
      page.links.forEach(tId => {
        const key                                 = `${page.id}-${tId}`;
        const { sx, sy, cpx, cpy, ex, ey, lx, ly } = this._curveData(page.id, tId);

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${sx},${sy} Q${cpx},${cpy} ${ex},${ey}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#3a7bd5');
        path.setAttribute('stroke-width', '1.8');
        path.setAttribute('opacity', '0.65');
        path.setAttribute('marker-end', 'url(#arr-blue)');
        path.classList.add('edge-path');

        const lbl = document.createElementNS(NS, 'text');
        lbl.setAttribute('x', lx);
        lbl.setAttribute('y', ly);
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('dominant-baseline', 'middle');
        lbl.setAttribute('fill', '#3a7bd5');
        lbl.setAttribute('font-size', '11');
        lbl.setAttribute('opacity', '0.9');
        lbl.classList.add('edge-label');
        lbl.textContent = this._prob(page.id);

        edgeLayer.append(path, lbl);
        this.edgeEls[key] = { path, lbl };
      });
    });

    // ── Nodes ────────────────────────────────────────────────────
    this.pages.forEach(page => {
      const pos = this.positions[page.id];
      const g   = document.createElementNS(NS, 'g');
      g.classList.add('node-group');

      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x',      pos.x - BOX_W / 2);
      rect.setAttribute('y',      pos.y - BOX_H / 2);
      rect.setAttribute('width',  BOX_W);
      rect.setAttribute('height', BOX_H);
      rect.setAttribute('rx',     BOX_RX);
      rect.classList.add('node-rect');

      const letterEl = document.createElementNS(NS, 'text');
      letterEl.setAttribute('x', pos.x);
      letterEl.setAttribute('y', pos.y - 16);
      letterEl.setAttribute('text-anchor', 'middle');
      letterEl.setAttribute('dominant-baseline', 'middle');
      letterEl.classList.add('node-letter');
      letterEl.textContent = PAGE_LABELS[page.id] ?? String(page.id + 1);

      const countEl = document.createElementNS(NS, 'text');
      countEl.setAttribute('x', pos.x);
      countEl.setAttribute('y', pos.y + 5);
      countEl.setAttribute('text-anchor', 'middle');
      countEl.setAttribute('dominant-baseline', 'middle');
      countEl.classList.add('node-count');
      countEl.textContent = '0';

      const pctEl = document.createElementNS(NS, 'text');
      pctEl.setAttribute('x', pos.x);
      pctEl.setAttribute('y', pos.y + 25);
      pctEl.setAttribute('text-anchor', 'middle');
      pctEl.setAttribute('dominant-baseline', 'middle');
      pctEl.classList.add('node-pct');
      pctEl.textContent = '0.00%';

      g.append(rect, letterEl, countEl, pctEl);
      nodeLayer.appendChild(g);
      this.nodeEls[page.id] = { g, rect, countEl, pctEl };
    });

    svg.append(edgeLayer, nodeLayer);
    this.container.appendChild(svg);
  }

  // ── Live update ───────────────────────────────────────────────

  /**
   * Called every animation frame.
   * @param {{ id: number, visits: number }[]} pages  Updated page array
   * @param {number|null} fromId  Page the surfer just left
   * @param {number|null} toId    Page the surfer just landed on
   */
  update(pages, fromId, toId) {
    this._restoreActiveEdge();
    this._clearCurrentNode();

    // Highlight the traversed edge in yellow
    if (fromId != null && toId != null) {
      const key = `${fromId}-${toId}`;
      const el  = this.edgeEls[key];
      if (el) {
        el.path.setAttribute('stroke', '#fbbc05');
        el.path.setAttribute('stroke-width', '2.8');
        el.path.setAttribute('opacity', '1');
        el.path.setAttribute('marker-end', 'url(#arr-yellow)');
        el.path.classList.add('edge-active');
        el.lbl.setAttribute('fill', '#fbbc05');
        this.activeKey = key;
      }
    }

    // Highlight & flash the current node
    if (toId != null) {
      const el = this.nodeEls[toId];
      if (el) {
        el.rect.classList.add('node-current');
        this._flash(el.g);
      }
    }

    // Refresh all visit counts and percentages
    const total = pages.reduce((s, p) => s + p.visits, 0);
    pages.forEach(page => {
      const el = this.nodeEls[page.id];
      if (!el) return;
      el.countEl.textContent = page.visits.toLocaleString();
      el.pctEl.textContent   = total > 0
        ? `${(page.visits / total * 100).toFixed(2)}%`
        : '0.00%';
    });
  }

  // ── Private helpers ───────────────────────────────────────────

  _restoreActiveEdge() {
    if (!this.activeKey) return;
    const el = this.edgeEls[this.activeKey];
    if (el) {
      el.path.setAttribute('stroke', '#3a7bd5');
      el.path.setAttribute('stroke-width', '1.8');
      el.path.setAttribute('opacity', '0.65');
      el.path.setAttribute('marker-end', 'url(#arr-blue)');
      el.path.classList.remove('edge-active');
      el.lbl.setAttribute('fill', '#3a7bd5');
    }
    this.activeKey = null;
  }

  _clearCurrentNode() {
    Object.values(this.nodeEls).forEach(({ rect }) => rect.classList.remove('node-current'));
  }

  _flash(nodeGroup) {
    nodeGroup.classList.remove('node-flash');
    void nodeGroup.getBoundingClientRect();   // force reflow to restart animation
    nodeGroup.classList.add('node-flash');
  }
}
