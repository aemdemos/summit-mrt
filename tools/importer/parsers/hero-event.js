/* eslint-disable */
/* global WebImporter */
/** Parser for hero-event. Base: hero. Source: https://www.marriott.com/default.mi */
export default function parse(element, { document }) {
  // Extract background image
  const bgImg = element.querySelector('img.heroBanner_background_image')
    || element.querySelector('.hb-item img')
    || element.querySelector('picture img');

  // Extract heading
  const heading = element.querySelector('h2.hb__heading')
    || element.querySelector('.hb__heading')
    || element.querySelector('h2');

  // Extract subheading
  const subheading = element.querySelector('p.hb__subheading')
    || element.querySelector('.hb__subheading');

  // Extract CTA link
  const cta = element.querySelector('a.m-button-primary-inverse')
    || element.querySelector('a.m-button-primary')
    || element.querySelector('.hb__cnt-sec a[href]');

  // Build text content cell
  const textContainer = document.createElement('div');
  if (heading) textContainer.append(heading);
  if (subheading) textContainer.append(subheading);
  if (cta) textContainer.append(cta);

  // Row 1: image, Row 2: text content
  const cells = [];
  if (bgImg) cells.push([bgImg]);
  cells.push([textContainer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-event', cells });
  element.replaceWith(block);
}
