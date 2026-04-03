/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer: Marriott homepage.
 * Inserts section breaks (<hr>) and section-metadata blocks based on
 * template sections from page-templates.json.
 * Runs only in afterTransform hook.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const { template } = payload || {};
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
    const doc = element.ownerDocument || document;

    // Process sections in reverse order to preserve DOM positions
    const sections = [...template.sections].reverse();

    sections.forEach((section, reverseIndex) => {
      const isFirst = reverseIndex === sections.length - 1;
      // section.selector can be a string or array of strings
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metaBlock);
      }

      // Add <hr> section break before each section (except the first)
      if (!isFirst) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
