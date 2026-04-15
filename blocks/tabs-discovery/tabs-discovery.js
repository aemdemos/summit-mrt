// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';

function updateRowNav(row) {
  const track = row.querySelector('.discovery-row-track');
  const prev = row.querySelector('.discovery-nav-prev');
  const next = row.querySelector('.discovery-nav-next');
  if (!track || !prev || !next) return;
  const { scrollLeft, scrollWidth, clientWidth } = track;
  prev.disabled = scrollLeft <= 1;
  next.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
}

/**
 * @param {Element} block
 * @param {Element} tablist
 */
function ensureTablistClickDelegation(block, tablist) {
  if (tablist.dataset.tabsClickDelegated === 'true') {
    return;
  }
  tablist.dataset.tabsClickDelegated = 'true';
  tablist.addEventListener('click', (e) => {
    const button = e.target.closest('button.tabs-discovery-tab');
    if (!button || !tablist.contains(button)) {
      return;
    }
    const panelId = button.getAttribute('aria-controls');
    if (!panelId) {
      return;
    }
    const tabpanel = document.getElementById(panelId);
    if (!tabpanel || !block.contains(tabpanel)) {
      return;
    }
    block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      panel.setAttribute('aria-hidden', true);
    });
    tablist.querySelectorAll('button.tabs-discovery-tab').forEach((btn) => {
      btn.setAttribute('aria-selected', false);
    });
    tabpanel.setAttribute('aria-hidden', false);
    button.setAttribute('aria-selected', true);
    // Update carousel nav buttons for newly visible panel
    requestAnimationFrame(() => {
      tabpanel.querySelectorAll('.discovery-row').forEach((row) => updateRowNav(row));
    });
  });
}

/**
 * @param {Element} row
 * @param {Element | null} tablist
 */
function isTabRowCandidate(row, tablist) {
  if (row === tablist || row.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  if (row.classList.contains('tabs-discovery-title')) {
    return false;
  }
  if (row.matches('.tabs-discovery-panel[role="tabpanel"]')) {
    return true;
  }
  return !!(row.firstElementChild && row.firstElementChild.children.length > 0);
}

/**
 * Rebuilds tab buttons and panel ids/indexes when tab items are added or removed.
 * @param {Element} block
 */
export function resyncTabsBlock(block) {
  const tablist = block.querySelector(':scope > .tabs-discovery-list');
  if (!tablist) {
    return;
  }

  // Ensure tablist is right after the optional title heading
  const title = block.querySelector(':scope > .tabs-discovery-title');
  const expectedPrev = title || null;
  if (expectedPrev) {
    if (tablist.previousElementSibling !== expectedPrev) {
      expectedPrev.after(tablist);
    }
  } else if (block.firstElementChild !== tablist) {
    block.insertBefore(tablist, block.firstElementChild);
  }

  const blockId = block.getAttribute('id');
  if (!blockId) {
    return;
  }

  const openResource = block.querySelector('.tabs-discovery-panel[aria-hidden="false"]')?.getAttribute('data-aue-resource');

  const rows = [...block.children].filter((c) => isTabRowCandidate(c, tablist));
  const MAX_TAB_ITEMS = 200;
  if (rows.length > MAX_TAB_ITEMS) {
    return;
  }

  const existingButtons = [...tablist.children];
  if (existingButtons.length > rows.length) {
    tablist.replaceChildren(...existingButtons.slice(0, rows.length));
  } else if (existingButtons.length < rows.length) {
    const fragment = document.createDocumentFragment();
    const toAdd = rows.length - existingButtons.length;
    for (let b = 0; b < toAdd; b += 1) {
      const btn = document.createElement('button');
      btn.className = 'tabs-discovery-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('type', 'button');
      fragment.append(btn);
    }
    tablist.append(fragment);
  }

  rows.forEach((row, i) => {
    const id = `tabpanel-${blockId}-tab-${i + 1}`;
    const buttonId = `tab-${id}`;

    const button = tablist.children[i];

    if (!row.matches('.tabs-discovery-panel[role="tabpanel"]')) {
      const tabCell = row.firstElementChild;
      if (!tabCell || !tabCell.children.length) {
        return;
      }
      const labelText = tabCell.textContent;
      tabCell.remove();

      row.className = 'tabs-discovery-panel';
      row.id = id;
      row.setAttribute('data-tab-index', String(i));
      row.setAttribute('aria-labelledby', buttonId);
      row.setAttribute('role', 'tabpanel');

      button.id = buttonId;
      button.textContent = labelText;
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-selected', 'false');

      if (button.firstElementChild) {
        moveInstrumentation(button.firstElementChild, null);
      }
    } else {
      row.className = 'tabs-discovery-panel';
      row.id = id;
      row.setAttribute('data-tab-index', String(i));
      row.setAttribute('aria-labelledby', buttonId);
      row.setAttribute('role', 'tabpanel');

      button.id = buttonId;
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-selected', 'false');
    }
  });

  let activeIdx = 0;
  if (openResource) {
    const idx = rows.findIndex((r) => r.getAttribute('data-aue-resource') === openResource);
    if (idx !== -1) {
      activeIdx = idx;
    }
  }

  rows.forEach((row, i) => {
    row.setAttribute('aria-hidden', String(i !== activeIdx));
  });
  tablist.querySelectorAll(':scope > button.tabs-discovery-tab').forEach((btn, i) => {
    btn.setAttribute('aria-selected', String(i === activeIdx));
  });

  ensureTablistClickDelegation(block, tablist);
}

function appendCardText(overlay, p, className) {
  if (p && !p.querySelector('img')) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = p.textContent;
    overlay.appendChild(el);
    p.remove();
  }
}

function buildDiscoveryCard(img, p, paragraphs, i) {
  const link = p.querySelector('a');
  const card = document.createElement('a');
  card.className = 'discovery-card';
  card.href = link?.href || '#';
  card.appendChild(img);

  const overlay = document.createElement('div');
  overlay.className = 'discovery-card-content';
  appendCardText(overlay, paragraphs[i + 1], 'discovery-card-eyebrow');
  appendCardText(overlay, paragraphs[i + 2], 'discovery-card-title');
  appendCardText(overlay, paragraphs[i + 3], 'discovery-card-desc');
  card.appendChild(overlay);
  return card;
}

/** Groups cards into rows of 2-3-2 with carousel navigation */
function buildCardRows(cards) {
  const ROW_SIZES = [2, 3, 2];
  const container = document.createElement('div');
  container.className = 'discovery-grid';
  let offset = 0;

  ROW_SIZES.forEach((size, rowIdx) => {
    const row = document.createElement('div');
    row.className = 'discovery-row';
    row.dataset.row = String(rowIdx + 1);

    const track = document.createElement('div');
    track.className = 'discovery-row-track';
    for (let c = 0; c < size && offset < cards.length; c += 1) {
      track.appendChild(cards[offset]);
      offset += 1;
    }
    row.appendChild(track);

    const nav = document.createElement('div');
    nav.className = 'discovery-row-nav';
    const prev = document.createElement('button');
    prev.className = 'discovery-nav-btn discovery-nav-prev';
    prev.setAttribute('type', 'button');
    prev.setAttribute('aria-label', 'Previous');
    const next = document.createElement('button');
    next.className = 'discovery-nav-btn discovery-nav-next';
    next.setAttribute('type', 'button');
    next.setAttribute('aria-label', 'Next');
    nav.appendChild(prev);
    nav.appendChild(next);
    row.appendChild(nav);

    container.appendChild(row);
  });
  return container;
}

function initRowCarousel(row) {
  if (row.dataset.carouselInit === 'true') {
    requestAnimationFrame(() => updateRowNav(row));
    return;
  }
  row.dataset.carouselInit = 'true';

  const track = row.querySelector('.discovery-row-track');
  const prev = row.querySelector('.discovery-nav-prev');
  const next = row.querySelector('.discovery-nav-next');
  if (!track || !prev || !next) return;

  prev.addEventListener('click', () => {
    const card = track.querySelector('.discovery-card');
    if (card) track.scrollBy({ left: -card.offsetWidth - 16, behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    const card = track.querySelector('.discovery-card');
    if (card) track.scrollBy({ left: card.offsetWidth + 16, behavior: 'smooth' });
  });

  track.addEventListener('scroll', () => updateRowNav(row), { passive: true });
  // Update after layout settles; also observe resize for responsive changes
  const observer = new ResizeObserver(() => updateRowNav(row));
  observer.observe(track);
}

export default async function decorate(block) {
  const blockId = getBlockId('tabs-discovery');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `tabs-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Tabs');

  let tablist = block.querySelector(':scope > .tabs-discovery-list');
  if (!tablist) {
    tablist = document.createElement('div');
    tablist.className = 'tabs-discovery-list';
    tablist.setAttribute('role', 'tablist');
    tablist.id = `tablist-${blockId}`;
    block.prepend(tablist);
  }

  // Extract title row (first row with only a heading, no tab content) and display above tabs.
  const firstRow = block.querySelector(':scope > div:not(.tabs-discovery-list)');
  if (firstRow) {
    const heading = firstRow.querySelector('h2');
    const cells = firstRow.firstElementChild ? [...firstRow.firstElementChild.children] : [];
    // If row has a heading and only one cell (no tab content cell), treat as title
    if (heading && cells.length <= 1) {
      heading.className = 'tabs-discovery-title';
      block.insertBefore(heading, tablist);
      firstRow.remove();
    }
  }

  ensureTablistClickDelegation(block, tablist);
  resyncTabsBlock(block);

  // Transform flat <p> content in each tab panel into card rows (2-3-2 layout).
  block.querySelectorAll('.tabs-discovery-panel').forEach((panel) => {
    const contentDiv = panel.querySelector(':scope > div');
    if (!contentDiv) return;

    const paragraphs = [...contentDiv.querySelectorAll(':scope > p')];
    const cards = [];

    for (let i = 0; i < paragraphs.length; i += 1) {
      const p = paragraphs[i];
      const img = p.querySelector('img');
      if (img) {
        cards.push(buildDiscoveryCard(img, p, paragraphs, i));
        p.remove();
      }
    }

    const grid = buildCardRows(cards);
    contentDiv.replaceChildren(grid);

    grid.querySelectorAll('.discovery-row').forEach((row) => initRowCarousel(row));
  });
}
