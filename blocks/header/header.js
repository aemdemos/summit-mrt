import { getMetadata } from '../../scripts/aem.js';
import { ensureDOMPurify } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

const MAX_BREADCRUMB_DEPTH = 20;

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    let depth = 0;
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
      depth += 1;
    } while (menuItem && depth < MAX_BREADCRUMB_DEPTH);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  crumbs.unshift({ title: 'Home', url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs.at(-1).url = null;
  }
  crumbs.at(-1)['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // prevent double decoration
  if (block.querySelector('nav#nav')) return;

  // load nav content directly to preserve nested list structure
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  // Try raw content file first (preserves full nested structure, e.g. Brands dropdown).
  // Fall back to AEM-processed path for published sites where /content/ doesn't exist.
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  const fragment = window.DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    RETURN_DOM: true,
  });

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  [...fragment.children].forEach((child) => nav.append(child));

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) {
      section.classList.add(`nav-${c}`);
      section.classList.add('section');
      section.setAttribute('data-section-status', 'loaded');
      // wrap direct children in default-content-wrapper if not already wrapped
      const existingWrapper = section.querySelector('.default-content-wrapper');
      if (!existingWrapper) {
        const wrapper = document.createElement('div');
        wrapper.className = 'default-content-wrapper';
        while (section.firstChild) wrapper.append(section.firstChild);
        section.append(wrapper);
      } else {
        // AEM may have pre-wrapped — ensure only one wrapper exists
        while (existingWrapper.nextElementSibling?.classList?.contains('default-content-wrapper')) {
          existingWrapper.append(...existingWrapper.nextElementSibling.childNodes);
          existingWrapper.nextElementSibling.remove();
        }
      }
    }
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('a.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const hasDropdown = !!navSection.querySelector('ul');
      if (hasDropdown) {
        navSection.classList.add('nav-drop');

        // Wrap the top-level text node as a clickable span (not a link)
        const link = navSection.querySelector(':scope > a');
        if (!link) {
          // Text-only dropdown trigger — wrap first text in a span
          const label = document.createElement('span');
          label.className = 'nav-drop-label';
          label.textContent = getDirectTextContent(navSection);
          // Remove the bare text node
          [...navSection.childNodes].forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) n.remove();
          });
          navSection.prepend(label);
        }
      }

      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) {
          if (hasDropdown) e.preventDefault();
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });

    // close dropdowns when search bar becomes sticky
    const searchForm = document.querySelector('.search-form-wrapper');
    if (searchForm) {
      const observer = new MutationObserver(() => {
        if (isDesktop.matches && searchForm.classList.contains('is-stuck')) {
          toggleAllNavSections(navSections, false);
        }
      });
      observer.observe(searchForm, { attributes: true, attributeFilter: ['class'] });
    }
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search && search.textContent === '') {
      search.setAttribute('aria-label', 'Search');
    }
    // remove any EDS-injected icon spans and inject MiIcons font icons
    navTools.querySelectorAll('span.icon').forEach((s) => s.remove());
    const miIconMap = new Map([
      ['Help', '\uE948'],
      ['English', '\uE9CB'],
      ['Trips', '\uE95B'],
      ['Sign In or Join', '\uE955'],
    ]);
    navTools.querySelectorAll('li a').forEach((a) => {
      const text = a.textContent.trim();
      const charCode = miIconMap.get(text);
      if (charCode && !a.querySelector('.mi-icon')) {
        const span = document.createElement('span');
        span.className = 'mi-icon';
        span.textContent = charCode;
        a.prepend(span);
      }
    });
  }

  // build dropdown panel: 3-column flex (col1 links, col2 links, promo)
  if (navSections) {
    navSections.querySelectorAll('.default-content-wrapper > ul > li > ul').forEach((subUl) => {
      const parent = subUl.parentElement;
      // skip if panel already built (prevents doubling on re-decoration)
      if (parent.querySelector('.nav-drop-panel')) return;
      const panel = document.createElement('div');
      panel.className = 'nav-drop-panel';

      const promoDiv = document.createElement('div');
      promoDiv.className = 'nav-promo';
      const regularItems = [];

      [...subUl.children].forEach((li) => {
        const a = li.querySelector(':scope > a');
        if (a && a.querySelector('img') && a.querySelector('strong') && a.querySelector('em')) {
          promoDiv.append(...li.childNodes);
        } else {
          regularItems.push(li);
        }
      });

      if (promoDiv.childNodes.length) {
        // standard dropdown: 2 link columns + promo sidebar
        const col1 = document.createElement('ul');
        const col2 = document.createElement('ul');
        const half = Math.ceil(regularItems.length / 2);
        regularItems.forEach((li, i) => {
          if (i < half) col1.append(li);
          else col2.append(li);
        });
        panel.append(col1);
        panel.append(col2);
        panel.append(promoDiv);

        // close button at bottom-right
        const closeRow = document.createElement('div');
        closeRow.className = 'nav-drop-footer';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'nav-drop-close';
        const xIcon = document.createElement('span');
        xIcon.textContent = '\u2715';
        close.append(xIcon);
        close.append(document.createTextNode(' Close'));
        close.addEventListener('click', () => {
          parent.setAttribute('aria-expanded', 'false');
        });
        closeRow.append(close);
        panel.append(closeRow);
      } else {
        // brands-style dropdown: flat grid of all items (no promo)
        panel.classList.add('nav-brands-grid');
        const gridUl = document.createElement('ul');
        const brandSlugs = new Map([
          ['Edition', 'edition'], ['The Ritz-Carlton', 'ritz-carlton'],
          ['The Luxury Collection', 'luxury-collection'], ['St. Regis', 'st-regis'],
          ['W Hotels', 'w-hotels'], ['JW Marriott', 'jw-marriott'],
          ['Marriott Hotels', 'marriott-hotels'], ['Sheraton', 'sheraton'],
          ['The Marriott Vacation Clubs', 'marriott-vacation-clubs'],
          ['Delta Hotels', 'delta-hotels'], ['Westin', 'westin'],
          ['Le Meridien', 'le-meridien'], ['Renaissance Hotels', 'renaissance'],
          ['Autograph Collection Hotels', 'autograph-collection'],
          ['Tribute Portfolio', 'tribute-portfolio'], ['Design Hotels', 'design-hotels'],
          ['Gaylord Hotels', 'gaylord-hotels'], ['MGM Collection', 'mgm-collection'],
          ['Outdoor Collection', 'outdoor-collection'], ['Courtyard', 'courtyard'],
          ['Four Points', 'four-points'], ['SpringHill Suites', 'springhill-suites'],
          ['Fairfield', 'fairfield'], ['AC Hotels', 'ac-hotels'],
          ['citizenM', 'citizenm'], ['Aloft Hotels', 'aloft-hotels'],
          ['Moxy Hotels', 'moxy-hotels'], ['Protea Hotels', 'protea-hotels'],
          ['City Express', 'city-express'], ['Four Points Flex', 'four-points-flex'],
          ['Series by Marriott', 'series'], ['Residence Inn', 'residence-inn'],
          ['TownePlace Suites', 'towneplace-suites'], ['Element', 'element'],
          ['StudioRes', 'studiores'], ['Marriott Executive Apartments', 'executive-apartments'],
          ['Homes & Villas', 'homes-villas'],
          ['Apartments by Marriott Bonvoy', 'apartments-marriott'],
        ]);
        regularItems.forEach((li) => {
          const a = li.querySelector('a');
          if (a && !a.querySelector('img')) {
            const text = a.textContent.trim();
            const slug = brandSlugs.get(text);
            if (slug) {
              const img = document.createElement('img');
              img.src = `/content/icons/brands/${slug}.svg`;
              img.alt = text;
              img.loading = 'lazy';
              a.textContent = '';
              a.append(img);
            }
          }
          gridUl.append(li);
        });
        panel.append(gridUl);

        // footer bar: Explore All Brands + Close
        const footer = document.createElement('div');
        footer.className = 'nav-drop-footer';
        const explore = document.createElement('a');
        explore.href = '/marriott-brands.mi';
        explore.className = 'nav-drop-explore';
        explore.textContent = 'Explore All Brands ';
        const arrow = document.createElement('span');
        arrow.textContent = '\u2192';
        explore.append(arrow);

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'nav-drop-close';
        const xIcon = document.createElement('span');
        xIcon.textContent = '\u2715';
        close.append(xIcon);
        close.append(document.createTextNode(' Close'));
        close.addEventListener('click', () => {
          parent.setAttribute('aria-expanded', 'false');
        });

        footer.append(explore);
        footer.append(close);
        panel.append(footer);
      }

      parent.append(panel);
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
