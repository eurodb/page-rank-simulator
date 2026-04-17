/**
 * ui.js
 * All DOM rendering and animation.  No simulation logic lives here.
 */

// ── Initial render ────────────────────────────────────────────

/**
 * Build page-box elements and insert them into the grid container.
 * @param {{ id: number, links: number[] }[]} pages
 * @param {HTMLElement} container
 */
export function renderPages(pages, container) {
  container.innerHTML = '';
  pages.forEach(page => container.appendChild(buildPageBox(page)));
}

function buildPageBox(page) {
  const box = document.createElement('div');
  box.className = 'page-box';
  box.id = `page-${page.id}`;
  box.style.setProperty('--intensity', '0');

  box.innerHTML = `
    <div class="page-header">Page ${page.id + 1}</div>
    <div class="visit-count" id="vc-${page.id}">0</div>
    <div class="visit-label">visits</div>
    <div class="visit-pct"   id="pct-${page.id}">0.00%</div>
    <div class="page-links">\u2192 ${page.links.map(l => `P${l + 1}`).join(', ')}</div>
  `;
  return box;
}

// ── Live stats update ─────────────────────────────────────────

/**
 * Refresh visit counts, percentages, and intensity glow for every page.
 * Call once per animation frame after one or more simulation steps.
 * @param {{ id: number, visits: number }[]} pages
 */
export function updateAllVisitCounts(pages) {
  const total    = pages.reduce((s, p) => s + p.visits, 0);
  const maxVisits = Math.max(...pages.map(p => p.visits), 1);

  pages.forEach(page => {
    const box    = document.getElementById(`page-${page.id}`);
    const vcEl   = document.getElementById(`vc-${page.id}`);
    const pctEl  = document.getElementById(`pct-${page.id}`);
    if (!box || !vcEl || !pctEl) return;

    vcEl.textContent  = page.visits.toLocaleString();
    pctEl.textContent = total > 0
      ? `${(page.visits / total * 100).toFixed(2)}%`
      : '0.00%';

    const intensity = page.visits / maxVisits;
    box.style.setProperty('--intensity', intensity.toFixed(4));

    // Add persistent glow class once visited
    if (page.visits > 0) box.classList.add('lit');
  });
}

// ── Flash + highlight ─────────────────────────────────────────

/**
 * Flash the newly-visited page and move the "current" highlight.
 * @param {number} pageId      Page that was just landed on
 * @param {number|null} prevId Previous current page (to remove highlight)
 */
export function flashAndHighlight(pageId, prevId) {
  // Remove old highlight
  if (prevId !== null && prevId !== undefined) {
    const prev = document.getElementById(`page-${prevId}`);
    if (prev) prev.classList.remove('current');
  }

  const box = document.getElementById(`page-${pageId}`);
  if (!box) return;

  // Add current-page highlight
  box.classList.add('current');

  // Restart flash animation (force reflow to replay keyframes)
  box.classList.remove('flash');
  void box.offsetWidth;
  box.classList.add('flash');
}

// ── Link structure legend ─────────────────────────────────────

/**
 * Render the human-readable link table in the legend section.
 * @param {{ id: number, links: number[] }[]} pages
 * @param {HTMLElement} container
 */
export function renderLinksList(pages, container) {
  container.innerHTML = pages.map(p => `
    <div class="link-item">
      <span class="link-from">Page ${p.id + 1}</span>
      <span class="link-arrow">\u2192</span>
      <span class="link-to">${p.links.map(l => `Page ${l + 1}`).join(', ')}</span>
    </div>
  `).join('');
}
