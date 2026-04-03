/* eslint-disable */
/* global WebImporter */
/** Parser for card-carousel-rentals. Base: card-carousel. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract carousel items
  const items = element.querySelectorAll('.card-layered-wrapper, .glide__slide');

  const cells = [];

  items.forEach((item) => {
    // Extract background image
    const img = item.querySelector('img')
      || item.querySelector('picture img');

    // Extract heading
    const heading = item.querySelector('h2.card-layered-header')
      || item.querySelector('.card-layered-header')
      || item.querySelector('h2, h3');

    // Extract link
    const link = item.querySelector('a[href]');

    // Build text cell
    const textCell = document.createElement('div');
    if (heading) textCell.append(heading);
    if (link && link.href) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = heading ? heading.textContent.trim() : 'View';
      textCell.append(a);
    }

    if (img || heading) {
      cells.push([img || '', textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-carousel-rentals', cells });
  element.replaceWith(block);
}
