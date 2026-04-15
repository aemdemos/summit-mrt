export default function decorate(block) {
  // Move the property/location link (last <p> in text cell) to be
  // a direct child of the block for absolute bottom-right positioning
  const textCell = block.children[1]?.querySelector(':scope > div');
  if (!textCell) return;

  const paragraphs = textCell.querySelectorAll(':scope > p');
  const lastP = paragraphs[paragraphs.length - 1];
  if (lastP?.querySelector('a[href*="hotels/"]')) {
    lastP.classList.add('hero-event-property-link');
    block.appendChild(lastP);
  }
}
