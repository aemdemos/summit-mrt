/* eslint-disable */
/* global WebImporter */
/** Parser for cards-promo. Base: cards. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract image
  const img = element.querySelector('img.merchandising-small-banner__image')
    || element.querySelector('.merchandising-small-banner__image-container img')
    || element.querySelector('picture img');

  // Extract heading
  const heading = element.querySelector('h5.merchandising-small-banner__content_heading')
    || element.querySelector('.merchandising-small-banner__content_heading')
    || element.querySelector('h5');

  // Extract description
  const desc = element.querySelector('.merchandising-small-banner__description');

  // Extract CTA link
  const cta = element.querySelector('a.merchandising-small-banner__button')
    || element.querySelector('.merchandising-small-banner a[href]');

  // Build text cell
  const textCell = document.createElement('div');
  if (heading) textCell.append(heading);
  if (desc) textCell.append(desc);
  if (cta) textCell.append(cta);

  // Cards block: each row = [image cell, text cell]
  const cells = [];
  cells.push([img || '', textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
