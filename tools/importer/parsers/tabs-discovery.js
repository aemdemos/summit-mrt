/* eslint-disable */
/* global WebImporter */
/** Parser for tabs-discovery. Base: tabs. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract section heading
  const sectionHeading = element.querySelector('.sc-e88c3075-2')
    || element.querySelector('[class*="sc-e88c3075"]');

  // Extract tab buttons/labels
  const tabButtons = element.querySelectorAll('.sc-c025c311-0 button, .tab-wrapper button');
  const tabLabels = [...tabButtons].map((btn) => (btn.textContent || '').trim()).filter(Boolean);

  // Extract tab content panels
  const tabPanels = element.querySelectorAll('.sc-e88c3075-13, .sc-e88c3075-15');

  // Build cells: each row = [tab label, tab content]
  const cells = [];

  // Add section heading as first row if present
  if (sectionHeading) {
    const headingEl = document.createElement('h2');
    headingEl.textContent = sectionHeading.textContent.trim();
    cells.push([headingEl]);
  }

  tabLabels.forEach((label, i) => {
    const labelCell = document.createElement('strong');
    labelCell.textContent = label;

    const contentCell = document.createElement('div');
    const panel = tabPanels[i];
    if (panel) {
      const cards = panel.querySelectorAll('.pdc-card, a[href]');
      cards.forEach((card) => {
        const cardImg = card.querySelector('img');
        const cardText = card.querySelector('.pdc-text, h3, h4, span');
        const cardDiv = document.createElement('div');
        if (cardImg) cardDiv.append(cardImg);
        if (cardText) cardDiv.append(cardText);
        if (card.tagName === 'A' && card.href) {
          const link = document.createElement('a');
          link.href = card.href;
          link.textContent = cardText ? cardText.textContent.trim() : label;
          cardDiv.append(link);
        }
        contentCell.append(cardDiv);
      });
    }

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-discovery', cells });
  element.replaceWith(block);
}
