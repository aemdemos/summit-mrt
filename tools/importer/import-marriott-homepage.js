/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroEventParser from './parsers/hero-event.js';
import cardsPromoParser from './parsers/cards-promo.js';
import tabsDiscoveryParser from './parsers/tabs-discovery.js';
import cardCarouselOffersParser from './parsers/card-carousel-offers.js';
import columnsMembershipParser from './parsers/columns-membership.js';
import cardCarouselRentalsParser from './parsers/card-carousel-rentals.js';
import cardsMiniParser from './parsers/cards-mini.js';
import tabsBrandsParser from './parsers/tabs-brands.js';

// TRANSFORMER IMPORTS
import marriottCleanupTransformer from './transformers/marriott-cleanup.js';
import marriottSectionsTransformer from './transformers/marriott-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-event': heroEventParser,
  'cards-promo': cardsPromoParser,
  'tabs-discovery': tabsDiscoveryParser,
  'card-carousel-offers': cardCarouselOffersParser,
  'columns-membership': columnsMembershipParser,
  'card-carousel-rentals': cardCarouselRentalsParser,
  'cards-mini': cardsMiniParser,
  'tabs-brands': tabsBrandsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'marriott-homepage',
  description: 'Marriott Bonvoy homepage with hero banner, tabbed destination discovery, promotional card carousels, membership CTA, vacation rentals, careers, and brand portfolio ribbon',
  urls: [
    'https://www.marriott.com/default.mi',
  ],
  blocks: [
    {
      name: 'hero-event',
      instances: ['.herobanner-fullbleed #hpHero'],
    },
    {
      name: 'cards-promo',
      instances: ['.merchandising-small-banner'],
    },
    {
      name: 'tabs-discovery',
      instances: ['.m-container-fullbleed.inverse'],
    },
    {
      name: 'card-carousel-offers',
      instances: ['#zanrufpjcxlwf3zk.glide'],
    },
    {
      name: 'columns-membership',
      instances: ['.sc-a3657010-0.kNRmdl'],
    },
    {
      name: 'card-carousel-rentals',
      instances: ['#qlwcwossfmqh253u.glide'],
    },
    {
      name: 'cards-mini',
      instances: ['#hpCareersMiniCard-mini-card-container'],
    },
    {
      name: 'tabs-brands',
      instances: ['.brand-ribbon-o-brand-portfolio'],
    },
  ],
  sections: [
    {
      id: 'section-2',
      name: 'Hero Banner',
      selector: '.herobanner-fullbleed',
      style: 'dark',
      blocks: ['hero-event'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Credit Card Banner',
      selector: '.merchandising-small-banner',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Discover Whats Waiting',
      selector: '.m-container-fullbleed.inverse',
      style: 'dark',
      blocks: ['tabs-discovery'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Get Away Get More',
      selector: '.sc-eee65d86-0.bVMjbn',
      style: null,
      blocks: ['card-carousel-offers'],
      defaultContent: ['h2.t-title-s'],
    },
    {
      id: 'section-6',
      name: 'Best Rates Membership',
      selector: '.sc-a3657010-0.kNRmdl',
      style: 'light',
      blocks: ['columns-membership'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'Vacation Home Rentals',
      selector: '.sc-eee65d86-0.bVMjbn',
      style: null,
      blocks: ['card-carousel-rentals'],
      defaultContent: ['h3.t-title-s', 'span.t-font-m'],
    },
    {
      id: 'section-8',
      name: 'Careers and App Download',
      selector: '#hpCareersMiniCard-mini-card-container',
      style: null,
      blocks: ['cards-mini'],
      defaultContent: [],
    },
    {
      id: 'section-9',
      name: 'Brand Portfolio Ribbon',
      selector: '.sc-1b180955-0.caoqwG',
      style: null,
      blocks: ['tabs-brands'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  marriottCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [marriottSectionsTransformer]
    : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '').replace(/\.mi$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
