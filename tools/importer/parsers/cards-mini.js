/* eslint-disable */
/* global WebImporter */
/** Parser for cards-mini. Base: cards. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract image
  const img = element.querySelector('img.miniCardImage')
    || element.querySelector('.miniCardImage')
    || element.querySelector('picture img');

  // Extract heading
  const heading = element.querySelector('h2.clampLines')
    || element.querySelector('.clampLines')
    || element.querySelector('h2');

  // Extract description
  const desc = element.querySelector('.miniCardContent .miniCardBody p')
    || element.querySelector('.miniCardBody p')
    || element.querySelector('.miniCardBody');

  // Extract link
  const link = element.querySelector('a.minicardlink')
    || element.querySelector('a[href]');

  // Build text cell
  const textCell = document.createElement('div');
  if (heading) textCell.append(heading);
  if (desc) textCell.append(desc);
  if (link && link.href) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = heading ? heading.textContent.trim() : 'Learn More';
    textCell.append(a);
  }

  // Cards block: single row = [image cell, text cell]
  const cells = [[img || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-mini', cells });
  element.replaceWith(block);
}
