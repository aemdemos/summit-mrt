/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Marriott site cleanup.
 * Selectors from captured DOM at https://www.marriott.com/default.mi
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent, privacy dialogs, and overlays (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#ot-sdk-btn-floating',
      '.ot-sdk-container',
      '[id^="ot-"]',
      '.display-on-focus.skip-links',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Header / navigation
      'header',
      '#navcontainer',
      '.navigation-container',
      // Search/booking widget
      '.search-form-position',
      '.document_search_form_container',
      // Footer
      '.sc-fa9e1a8d-2.ccvMRe',
      // General non-authorable elements
      'iframe',
      'noscript',
      'link',
      'source',
      // Ads / tracking
      '.mmn-ads-container',
    ]);

    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
    });
  }
}
