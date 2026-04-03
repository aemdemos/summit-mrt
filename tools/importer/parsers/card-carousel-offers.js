/* eslint-disable */
/* global WebImporter */
/** Parser for card-carousel-offers. Base: card-carousel. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract carousel items
  const items = element.querySelectorAll('.merchandising-card-tile, .glide__slide a[href]');

  const cells = [];

  items.forEach((item) => {
    // Extract image
    const img = item.querySelector('img.merchandising-card-tile__container__image')
      || item.querySelector('img');

    // Extract heading
    const heading = item.querySelector('h4.merchandising-card-tile__container__content__card-texts__header')
      || item.querySelector('h4')
      || item.querySelector('[class*="header"]');

    // Build text cell
    const textCell = document.createElement('div');
    if (heading) textCell.append(heading);

    // Add link if the item is or contains a link
    const link = item.tagName === 'A' ? item : item.querySelector('a[href]');
    if (link && link.href) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = heading ? heading.textContent.trim() : 'Learn More';
      textCell.append(a);
    }

    cells.push([img || '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'card-carousel-offers', cells });
  element.replaceWith(block);
}
