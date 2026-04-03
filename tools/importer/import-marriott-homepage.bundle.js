var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-marriott-homepage.js
  var import_marriott_homepage_exports = {};
  __export(import_marriott_homepage_exports, {
    default: () => import_marriott_homepage_default
  });

  // tools/importer/parsers/hero-event.js
  function parse(element, { document }) {
    const bgImg = element.querySelector("img.heroBanner_background_image") || element.querySelector(".hb-item img") || element.querySelector("picture img");
    const heading = element.querySelector("h2.hb__heading") || element.querySelector(".hb__heading") || element.querySelector("h2");
    const subheading = element.querySelector("p.hb__subheading") || element.querySelector(".hb__subheading");
    const cta = element.querySelector("a.m-button-primary-inverse") || element.querySelector("a.m-button-primary") || element.querySelector(".hb__cnt-sec a[href]");
    const textContainer = document.createElement("div");
    if (heading) textContainer.append(heading);
    if (subheading) textContainer.append(subheading);
    if (cta) textContainer.append(cta);
    const cells = [];
    if (bgImg) cells.push([bgImg]);
    cells.push([textContainer]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-event", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse2(element, { document }) {
    const img = element.querySelector("img.merchandising-small-banner__image") || element.querySelector(".merchandising-small-banner__image-container img") || element.querySelector("picture img");
    const heading = element.querySelector("h5.merchandising-small-banner__content_heading") || element.querySelector(".merchandising-small-banner__content_heading") || element.querySelector("h5");
    const desc = element.querySelector(".merchandising-small-banner__description");
    const cta = element.querySelector("a.merchandising-small-banner__button") || element.querySelector(".merchandising-small-banner a[href]");
    const textCell = document.createElement("div");
    if (heading) textCell.append(heading);
    if (desc) textCell.append(desc);
    if (cta) textCell.append(cta);
    const cells = [];
    cells.push([img || "", textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-discovery.js
  function parse3(element, { document }) {
    const sectionHeading = element.querySelector(".sc-e88c3075-2") || element.querySelector('[class*="sc-e88c3075"]');
    const tabButtons = element.querySelectorAll(".sc-c025c311-0 button, .tab-wrapper button");
    const tabLabels = [...tabButtons].map((btn) => (btn.textContent || "").trim()).filter(Boolean);
    const tabPanels = element.querySelectorAll(".sc-e88c3075-13, .sc-e88c3075-15");
    const cells = [];
    if (sectionHeading) {
      const headingEl = document.createElement("h2");
      headingEl.textContent = sectionHeading.textContent.trim();
      cells.push([headingEl]);
    }
    tabLabels.forEach((label, i) => {
      const labelCell = document.createElement("strong");
      labelCell.textContent = label;
      const contentCell = document.createElement("div");
      const panel = tabPanels[i];
      if (panel) {
        const cards = panel.querySelectorAll(".pdc-card, a[href]");
        cards.forEach((card) => {
          const cardImg = card.querySelector("img");
          const cardText = card.querySelector(".pdc-text, h3, h4, span");
          const cardDiv = document.createElement("div");
          if (cardImg) cardDiv.append(cardImg);
          if (cardText) cardDiv.append(cardText);
          if (card.tagName === "A" && card.href) {
            const link = document.createElement("a");
            link.href = card.href;
            link.textContent = cardText ? cardText.textContent.trim() : label;
            cardDiv.append(link);
          }
          contentCell.append(cardDiv);
        });
      }
      cells.push([labelCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-discovery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/card-carousel-offers.js
  function parse4(element, { document }) {
    const items = element.querySelectorAll(".merchandising-card-tile, .glide__slide a[href]");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img.merchandising-card-tile__container__image") || item.querySelector("img");
      const heading = item.querySelector("h4.merchandising-card-tile__container__content__card-texts__header") || item.querySelector("h4") || item.querySelector('[class*="header"]');
      const textCell = document.createElement("div");
      if (heading) textCell.append(heading);
      const link = item.tagName === "A" ? item : item.querySelector("a[href]");
      if (link && link.href) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = heading ? heading.textContent.trim() : "Learn More";
        textCell.append(a);
      }
      cells.push([img || "", textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "card-carousel-offers", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-membership.js
  function parse5(element, { document }) {
    const leftCol = document.createElement("div");
    const heading = element.querySelector("h2.ifb-head") || element.querySelector(".ifb-head") || element.querySelector("h2");
    if (heading) leftCol.append(heading);
    const desc = element.querySelector("p.ifb-desc") || element.querySelector(".ifb-desc");
    if (desc) leftCol.append(desc);
    const primaryCta = element.querySelector("a.m-button-primary");
    if (primaryCta) leftCol.append(primaryCta);
    const secondaryCta = element.querySelector("a.m-button-secondary");
    if (secondaryCta) leftCol.append(secondaryCta);
    const rightCol = document.createElement("div");
    const iconContainer = element.querySelector(".icon-block-container") || element.querySelector('[class*="icon-block"]');
    if (iconContainer) {
      const iconItems = iconContainer.querySelectorAll(".icon-block-item");
      iconItems.forEach((item) => {
        const iconSpan = item.querySelector('span[class*="icon"]');
        const labelSpan = item.querySelector('span:not([class*="icon"])');
        const itemDiv = document.createElement("div");
        if (iconSpan) itemDiv.append(iconSpan);
        if (labelSpan) itemDiv.append(labelSpan);
        rightCol.append(itemDiv);
      });
    }
    const cells = [[leftCol, rightCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-membership", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/card-carousel-rentals.js
  function parse6(element, { document }) {
    const items = element.querySelectorAll(".card-layered-wrapper, .glide__slide");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img") || item.querySelector("picture img");
      const heading = item.querySelector("h2.card-layered-header") || item.querySelector(".card-layered-header") || item.querySelector("h2, h3");
      const link = item.querySelector("a[href]");
      const textCell = document.createElement("div");
      if (heading) textCell.append(heading);
      if (link && link.href) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = heading ? heading.textContent.trim() : "View";
        textCell.append(a);
      }
      if (img || heading) {
        cells.push([img || "", textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "card-carousel-rentals", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-mini.js
  function parse7(element, { document }) {
    const img = element.querySelector("img.miniCardImage") || element.querySelector(".miniCardImage") || element.querySelector("picture img");
    const heading = element.querySelector("h2.clampLines") || element.querySelector(".clampLines") || element.querySelector("h2");
    const desc = element.querySelector(".miniCardContent .miniCardBody p") || element.querySelector(".miniCardBody p") || element.querySelector(".miniCardBody");
    const link = element.querySelector("a.minicardlink") || element.querySelector("a[href]");
    const textCell = document.createElement("div");
    if (heading) textCell.append(heading);
    if (desc) textCell.append(desc);
    if (link && link.href) {
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = heading ? heading.textContent.trim() : "Learn More";
      textCell.append(a);
    }
    const cells = [[img || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-mini", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-brands.js
  function parse8(element, { document }) {
    const header = element.querySelector("h2.brand-ribbon-header") || element.querySelector(".brand-ribbon-header") || element.querySelector("h2");
    const cells = [];
    if (header) {
      cells.push([header]);
    }
    const categories = element.querySelectorAll('[class*="brand-ribbon-category"]');
    const processedLabels = /* @__PURE__ */ new Set();
    categories.forEach((cat) => {
      const label = cat.querySelector("h3.brand-ribbon-category-label") || cat.querySelector(".brand-ribbon-category-label") || cat.querySelector("h3");
      const labelText = label ? label.textContent.trim() : "";
      if (!labelText || processedLabels.has(labelText)) return;
      processedLabels.add(labelText);
      const labelCell = document.createElement("strong");
      labelCell.textContent = labelText;
      const contentCell = document.createElement("div");
      const desc = cat.querySelector("p.brand-ribbon-category-description") || cat.querySelector(".brand-ribbon-category-description");
      if (desc) contentCell.append(desc);
      const brandList = cat.querySelector("ul.brand-ribbon-category-list") || cat.querySelector(".brand-ribbon-category-list");
      if (brandList) {
        const items = brandList.querySelectorAll("li.brand-ribbon-category-list-item, li");
        items.forEach((li) => {
          const brandImg = li.querySelector("img");
          const brandLink = li.querySelector("a[href]");
          const brandDiv = document.createElement("div");
          if (brandImg) brandDiv.append(brandImg);
          if (brandLink && brandLink.href) {
            const a = document.createElement("a");
            a.href = brandLink.href;
            a.textContent = brandLink.textContent.trim() || (brandImg ? brandImg.alt : "");
            brandDiv.append(a);
          }
          contentCell.append(brandDiv);
        });
      }
      cells.push([labelCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-brands", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/marriott-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#ot-sdk-btn-floating",
        ".ot-sdk-container",
        '[id^="ot-"]',
        ".display-on-focus.skip-links"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Header / navigation
        "header",
        "#navcontainer",
        ".navigation-container",
        // Search/booking widget
        ".search-form-position",
        ".document_search_form_container",
        // Footer
        ".sc-fa9e1a8d-2.ccvMRe",
        // General non-authorable elements
        "iframe",
        "noscript",
        "link",
        "source",
        // Ads / tracking
        ".mmn-ads-container"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/marriott-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const { template } = payload || {};
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const doc = element.ownerDocument || document;
      const sections = [...template.sections].reverse();
      sections.forEach((section, reverseIndex) => {
        const isFirst = reverseIndex === sections.length - 1;
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (!isFirst) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-marriott-homepage.js
  var parsers = {
    "hero-event": parse,
    "cards-promo": parse2,
    "tabs-discovery": parse3,
    "card-carousel-offers": parse4,
    "columns-membership": parse5,
    "card-carousel-rentals": parse6,
    "cards-mini": parse7,
    "tabs-brands": parse8
  };
  var PAGE_TEMPLATE = {
    name: "marriott-homepage",
    description: "Marriott Bonvoy homepage with hero banner, tabbed destination discovery, promotional card carousels, membership CTA, vacation rentals, careers, and brand portfolio ribbon",
    urls: [
      "https://www.marriott.com/default.mi"
    ],
    blocks: [
      {
        name: "hero-event",
        instances: [".herobanner-fullbleed #hpHero"]
      },
      {
        name: "cards-promo",
        instances: [".merchandising-small-banner"]
      },
      {
        name: "tabs-discovery",
        instances: [".m-container-fullbleed.inverse"]
      },
      {
        name: "card-carousel-offers",
        instances: ["#zanrufpjcxlwf3zk.glide"]
      },
      {
        name: "columns-membership",
        instances: [".sc-a3657010-0.kNRmdl"]
      },
      {
        name: "card-carousel-rentals",
        instances: ["#qlwcwossfmqh253u.glide"]
      },
      {
        name: "cards-mini",
        instances: ["#hpCareersMiniCard-mini-card-container"]
      },
      {
        name: "tabs-brands",
        instances: [".brand-ribbon-o-brand-portfolio"]
      }
    ],
    sections: [
      {
        id: "section-2",
        name: "Hero Banner",
        selector: ".herobanner-fullbleed",
        style: "dark",
        blocks: ["hero-event"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Credit Card Banner",
        selector: ".merchandising-small-banner",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Discover Whats Waiting",
        selector: ".m-container-fullbleed.inverse",
        style: "dark",
        blocks: ["tabs-discovery"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Get Away Get More",
        selector: ".sc-eee65d86-0.bVMjbn",
        style: null,
        blocks: ["card-carousel-offers"],
        defaultContent: ["h2.t-title-s"]
      },
      {
        id: "section-6",
        name: "Best Rates Membership",
        selector: ".sc-a3657010-0.kNRmdl",
        style: "light",
        blocks: ["columns-membership"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "Vacation Home Rentals",
        selector: ".sc-eee65d86-0.bVMjbn",
        style: null,
        blocks: ["card-carousel-rentals"],
        defaultContent: ["h3.t-title-s", "span.t-font-m"]
      },
      {
        id: "section-8",
        name: "Careers and App Download",
        selector: "#hpCareersMiniCard-mini-card-container",
        style: null,
        blocks: ["cards-mini"],
        defaultContent: []
      },
      {
        id: "section-9",
        name: "Brand Portfolio Ribbon",
        selector: ".sc-1b180955-0.caoqwG",
        style: null,
        blocks: ["tabs-brands"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_marriott_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "").replace(/\.mi$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_marriott_homepage_exports);
})();
