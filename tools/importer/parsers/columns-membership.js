/* eslint-disable */
/* global WebImporter */
/** Parser for columns-membership. Base: columns. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Left column: heading, description, CTAs
  const leftCol = document.createElement('div');

  const heading = element.querySelector('h2.ifb-head')
    || element.querySelector('.ifb-head')
    || element.querySelector('h2');
  if (heading) leftCol.append(heading);

  const desc = element.querySelector('p.ifb-desc')
    || element.querySelector('.ifb-desc');
  if (desc) leftCol.append(desc);

  const primaryCta = element.querySelector('a.m-button-primary');
  if (primaryCta) leftCol.append(primaryCta);

  const secondaryCta = element.querySelector('a.m-button-secondary');
  if (secondaryCta) leftCol.append(secondaryCta);

  // Right column: benefit icons
  const rightCol = document.createElement('div');
  const iconContainer = element.querySelector('.icon-block-container')
    || element.querySelector('[class*="icon-block"]');

  if (iconContainer) {
    const iconItems = iconContainer.querySelectorAll('.icon-block-item');
    iconItems.forEach((item) => {
      const iconSpan = item.querySelector('span[class*="icon"]');
      const labelSpan = item.querySelector('span:not([class*="icon"])');
      const itemDiv = document.createElement('div');
      if (iconSpan) itemDiv.append(iconSpan);
      if (labelSpan) itemDiv.append(labelSpan);
      rightCol.append(itemDiv);
    });
  }

  // Columns block: single row = [left column, right column]
  const cells = [[leftCol, rightCol]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-membership', cells });
  element.replaceWith(block);
}
