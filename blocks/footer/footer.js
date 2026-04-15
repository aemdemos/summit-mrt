import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Add accordion behavior for Top Destinations section
  const sections = footer.querySelectorAll('.section');
  sections.forEach((section) => {
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

  block.append(footer);
}
