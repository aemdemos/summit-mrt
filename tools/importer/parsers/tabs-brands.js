/* eslint-disable */
/* global WebImporter */
/** Parser for tabs-brands. Base: tabs. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract header
  const header = element.querySelector('h2.brand-ribbon-header')
    || element.querySelector('.brand-ribbon-header')
    || element.querySelector('h2');

  const cells = [];

  // Add header as first row if present
  if (header) {
    cells.push([header]);
  }

  // Extract category tabs
  const categories = element.querySelectorAll('[class*="brand-ribbon-category"]');
  const processedLabels = new Set();

  categories.forEach((cat) => {
    const label = cat.querySelector('h3.brand-ribbon-category-label')
      || cat.querySelector('.brand-ribbon-category-label')
      || cat.querySelector('h3');
    const labelText = label ? label.textContent.trim() : '';

    if (!labelText || processedLabels.has(labelText)) return;
    processedLabels.add(labelText);

    const labelCell = document.createElement('strong');
    labelCell.textContent = labelText;

    // Build content cell with description and brand logos
    const contentCell = document.createElement('div');

    const desc = cat.querySelector('p.brand-ribbon-category-description')
      || cat.querySelector('.brand-ribbon-category-description');
    if (desc) contentCell.append(desc);

    const brandList = cat.querySelector('ul.brand-ribbon-category-list')
      || cat.querySelector('.brand-ribbon-category-list');
    if (brandList) {
      const items = brandList.querySelectorAll('li.brand-ribbon-category-list-item, li');
      items.forEach((li) => {
        const brandImg = li.querySelector('img');
        const brandLink = li.querySelector('a[href]');
        const brandDiv = document.createElement('div');
        if (brandImg) brandDiv.append(brandImg);
        if (brandLink && brandLink.href) {
          const a = document.createElement('a');
          a.href = brandLink.href;
          a.textContent = brandLink.textContent.trim() || (brandImg ? brandImg.alt : '');
          brandDiv.append(a);
        }
        contentCell.append(brandDiv);
      });
    }

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-brands', cells });
  element.replaceWith(block);
}
