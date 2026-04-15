import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

function getVisibleCount(track) {
  const card = track.querySelector('.card-carousel-offers-slide');
  if (!card || !track.clientWidth) return 1;
  return Math.round(track.clientWidth / (card.offsetWidth + 16)) || 1;
}

function getDotCount(total, visible) {
  return Math.max(1, total - visible + 1);
}

function getCurrentPosition(track) {
  const card = track.querySelector('.card-carousel-offers-slide');
  if (!card) return 0;
  const step = card.offsetWidth + 16;
  return Math.round(track.scrollLeft / step);
}

function scrollToPosition(track, pos) {
  const card = track.querySelector('.card-carousel-offers-slide');
  if (!card) return;
  const step = card.offsetWidth + 16;
  track.scrollTo({ left: pos * step, behavior: 'smooth' });
}

function buildPageDots(pageCount, container) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Carousel page controls');
  const list = document.createElement('ol');
  list.className = 'carousel-page-dots';
  for (let i = 0; i < pageCount; i += 1) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Show position ${i + 1} of ${pageCount}`);
    btn.dataset.page = String(i);
    li.appendChild(btn);
    list.appendChild(li);
  }
  nav.appendChild(list);
  container.appendChild(nav);
  return list;
}

export default function decorate(block) {
  const blockId = getBlockId('card-carousel-offers');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `carousel-${blockId}`);
  block.setAttribute('role', 'region');

  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  const wrap = document.createElement('div');
  // eslint-disable-next-line secure-coding/no-hardcoded-credentials
  wrap.classList.add('card-carousel-offers-slides-wrap');

  const track = document.createElement('ul');
  track.classList.add('card-carousel-offers-slides');
  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', 'Card carousel slides');

  // Prev / Next buttons
  let prevBtn;
  let nextBtn;
  if (!isSingleSlide) {
    const btns = document.createElement('div');
    btns.className = 'carousel-navigation-buttons';
    prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'slide-prev';
    prevBtn.setAttribute('aria-label', 'Previous Slide');
    nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'slide-next';
    nextBtn.setAttribute('aria-label', 'Next Slide');
    btns.append(prevBtn, nextBtn);
    wrap.appendChild(btns);
  }

  rows.forEach((row, idx) => {
    const card = createCard(row);
    card.classList.add('card-carousel-offers-slide');
    card.dataset.slideIndex = idx;
    track.append(card);
    row.remove();
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  wrap.appendChild(track);
  block.prepend(wrap);

  if (isSingleSlide) return;

  // Position-based dots: total - visible + 1
  const totalCards = rows.length;
  let visible = getVisibleCount(track);
  let dotCount = getDotCount(totalCards, visible);
  let dotList = buildPageDots(dotCount, wrap);

  const btnsWrap = wrap.querySelector('.carousel-navigation-buttons');

  const updateState = () => {
    const pos = getCurrentPosition(track);
    const { scrollLeft, scrollWidth, clientWidth } = track;

    // Keep nav buttons vertically centered on the cards
    btnsWrap.style.height = `${track.offsetHeight}px`;

    // Arrows
    prevBtn.classList.toggle('hidden', scrollLeft <= 1);
    nextBtn.classList.toggle('hidden', scrollLeft + clientWidth >= scrollWidth - 1);

    // Dots — clamp to valid range
    const activeDot = Math.min(pos, dotCount - 1);
    dotList.querySelectorAll('button').forEach((btn, i) => {
      btn.toggleAttribute('disabled', i === activeDot);
    });
  };

  // Dot clicks
  dotList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn) return;
    scrollToPosition(track, parseInt(btn.dataset.page, 10));
  });

  // Prev / Next clicks — advance by 1 card
  prevBtn.addEventListener('click', () => {
    const pos = getCurrentPosition(track);
    scrollToPosition(track, Math.max(0, pos - 1));
  });
  nextBtn.addEventListener('click', () => {
    const pos = getCurrentPosition(track);
    scrollToPosition(track, Math.min(totalCards - 1, pos + 1));
  });

  // Scroll sync
  track.addEventListener('scroll', updateState, { passive: true });

  // Rebuild dots on resize (visible count may change)
  const observer = new ResizeObserver(() => {
    const newVisible = getVisibleCount(track);
    const newDotCount = getDotCount(totalCards, newVisible);
    if (newDotCount !== dotCount || newVisible !== visible) {
      visible = newVisible;
      dotCount = newDotCount;
      dotList.closest('nav').remove();
      dotList = buildPageDots(dotCount, wrap);
      dotList.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-page]');
        if (!btn) return;
        scrollToPosition(track, parseInt(btn.dataset.page, 10));
      });
    }
    updateState();
  });
  observer.observe(track);

  // Keyboard
  track.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const card = track.querySelector('.card-carousel-offers-slide');
    if (!card) return;
    const step = card.offsetWidth + 16;
    track.scrollBy({ left: e.key === 'ArrowLeft' ? -step : step, behavior: 'smooth' });
  });
}
