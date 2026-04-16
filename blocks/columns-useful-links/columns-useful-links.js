import { getBlockId } from '../../scripts/scripts.js';

export default function decorate(block) {
  const blockId = getBlockId('columns-useful-links');
  block.setAttribute('id', blockId);

  const row = block.firstElementChild;
  if (row) {
    row.className = 'columns-useful-links-row';
    [...row.children].forEach((col) => {
      col.className = 'columns-useful-links-col';
    });
  }

  // Mark external links (not marriott.com)
  block.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const isExternal = href.startsWith('http') && !href.includes('marriott.com');
    a.classList.add(isExternal ? 'link-external' : 'link-internal');
  });
}
