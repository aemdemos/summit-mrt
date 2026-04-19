import { getMetadata } from '../../scripts/aem.js';
import { ensureDOMPurify } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Fetch footer content directly to preserve nested div structure
  // (loadFragment/decorateMain flattens inner divs on published endpoints)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let resp = await fetch(`${footerPath}.plain.html`);
  if (!resp.ok) {
    resp = await fetch('/content/footer.plain.html');
  }
  if (!resp.ok) return;
  const html = await resp.text();
  await ensureDOMPurify();
  const fragment = window.DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    RETURN_DOM: true,
  });

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');

  // Each top-level <div> in footer.plain.html becomes a section
  [...fragment.children].forEach((section) => {
    section.classList.add('footer-section');
    footer.append(section);
  });

  // First section: 4-column link grid — tag it for CSS
  const linkGrid = footer.querySelector('.footer-section');
  if (linkGrid) {
    linkGrid.classList.add('footer-links');
  }

  // Top Destinations accordion
  footer.querySelectorAll('.footer-section').forEach((section) => {
    const heading = section.querySelector('p > strong');
    if (heading && heading.textContent.trim() === 'Top Destinations') {
      section.classList.add('footer-accordion');
      const trigger = heading.closest('p');
      const list = section.querySelector('ul');
      if (trigger && list) {
        list.setAttribute('aria-hidden', 'true');
        trigger.addEventListener('click', () => {
          const expanded = list.getAttribute('aria-hidden') === 'false';
          list.setAttribute('aria-hidden', expanded ? 'true' : 'false');
          trigger.classList.toggle('expanded', !expanded);
        });
      }
    }
  });

  // Social links section
  footer.querySelectorAll('.footer-section').forEach((section) => {
    const heading = section.querySelector('p > strong');
    if (heading && heading.textContent.trim() === 'Follow Marriott Bonvoy') {
      section.classList.add('footer-social');
    }
  });

  // Copyright section (last)
  const lastSection = footer.querySelector('.footer-section:last-child');
  if (lastSection && !lastSection.classList.contains('footer-social')
    && !lastSection.classList.contains('footer-accordion')) {
    lastSection.classList.add('footer-copyright');
  }

  block.append(footer);
}
