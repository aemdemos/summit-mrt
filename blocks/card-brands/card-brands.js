import { getBlockId } from '../../scripts/scripts.js';

export default function decorate(block) {
  const blockId = getBlockId('card-brands');
  block.setAttribute('id', blockId);

  const rows = [...block.children];

  // First row is the title heading
  const firstRow = rows[0];
  const heading = firstRow?.querySelector('h2');
  if (heading) {
    heading.className = 'card-brands-title';
    block.insertBefore(heading, firstRow);
    firstRow.remove();
  }

  // Remaining rows are category cards
  const grid = document.createElement('div');
  grid.className = 'card-brands-grid';

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const card = document.createElement('div');
    card.className = 'card-brands-card';

    // Category name from first cell
    const nameCell = cells[0];
    const label = document.createElement('h3');
    label.className = 'card-brands-label';
    label.textContent = nameCell.textContent.trim();
    card.appendChild(label);

    // Content from second cell: description + brand logo links
    const contentCell = cells[1];
    const paragraphs = [...contentCell.querySelectorAll('p')];

    // First paragraph is the description
    if (paragraphs.length > 0) {
      const desc = document.createElement('p');
      desc.className = 'card-brands-desc';
      desc.textContent = paragraphs[0].textContent;
      card.appendChild(desc);
    }

    // Remaining paragraphs are brand logo links
    const brands = document.createElement('div');
    brands.className = 'card-brands-links';
    paragraphs.slice(1).forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        link.target = '_blank';
        link.rel = 'noopener';
        brands.appendChild(link);
      }
    });
    card.appendChild(brands);

    grid.appendChild(card);
    row.remove();
  });

  block.appendChild(grid);
}
