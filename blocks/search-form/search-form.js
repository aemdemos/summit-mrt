function getCalendarDayClass(day, todayDate) {
  if (day === todayDate) return 'cal-day cal-today';
  if (day > todayDate) return 'cal-day cal-available';
  return 'cal-day cal-past';
}

function buildCalendarDOM(baseDate) {
  const month = baseDate.getMonth();
  const year = baseDate.getFullYear();
  const todayDate = baseDate.getDate();
  const monthName = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const container = document.createDocumentFragment();

  const header = document.createElement('div');
  header.className = 'cal-header';
  header.textContent = monthName;
  container.appendChild(header);

  const weekdays = document.createElement('div');
  weekdays.className = 'cal-weekdays';
  weekdays.textContent = 'Su Mo Tu We Th Fr Sa';
  container.appendChild(weekdays);

  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement('span');
    empty.className = 'cal-day cal-empty';
    grid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const span = document.createElement('span');
    span.className = getCalendarDayClass(d, todayDate);
    span.textContent = d;
    grid.appendChild(span);
  }

  container.appendChild(grid);
  return container;
}

function createField(className, iconClass, label, inputAttrs) {
  const field = document.createElement('div');
  field.className = `search-field ${className}`;

  const lbl = document.createElement('label');
  lbl.className = 'search-field-label';

  const icon = document.createElement('span');
  icon.className = `search-field-icon ${iconClass}`;
  lbl.appendChild(icon);

  const labelText = document.createTextNode(label);
  lbl.appendChild(labelText);
  field.appendChild(lbl);

  const input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  Object.entries(inputAttrs).forEach(([k, v]) => { input[k] = v; });
  field.appendChild(input);

  return field;
}

export default function decorate(block) {
  const rows = [...block.children];
  const destinationText = rows[0]?.textContent?.trim() || 'Where can we take you?';

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const defaultDates = `${fmt(today)} - ${fmt(tomorrow)}`;

  block.textContent = '';

  const form = document.createElement('div');
  form.className = 'search-form-inner';

  const fields = document.createElement('div');
  fields.className = 'search-form-fields';

  fields.appendChild(createField('search-field-destination', 'search-icon-pin', 'Destination', { placeholder: destinationText }));

  const divider = document.createElement('div');
  divider.className = 'search-field-divider';
  fields.appendChild(divider);

  fields.appendChild(createField('search-field-dates', 'search-icon-calendar', 'Dates', { value: defaultDates }));

  form.appendChild(fields);

  const submitBtn = document.createElement('button');
  submitBtn.className = 'search-form-submit';
  submitBtn.type = 'button';
  const searchIcon = document.createElement('span');
  searchIcon.className = 'search-icon-search';
  submitBtn.appendChild(searchIcon);
  const btnLabel = document.createElement('span');
  btnLabel.textContent = 'Find Hotels';
  submitBtn.appendChild(btnLabel);
  form.appendChild(submitBtn);

  block.appendChild(form);

  // Date picker popup (cosmetic only)
  const datesField = block.querySelector('.search-field-dates');

  datesField.addEventListener('click', () => {
    let popup = block.querySelector('.search-datepicker');
    if (popup) {
      popup.remove();
      return;
    }
    popup = document.createElement('div');
    popup.className = 'search-datepicker';
    popup.appendChild(buildCalendarDOM(today));
    datesField.appendChild(popup);

    const close = (e) => {
      if (!popup.contains(e.target) && !datesField.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 10);
  });

  // Move wrapper to be a direct child of <main> so position: sticky
  // works relative to the full page, not just the containing section.
  const wrapper = block.closest('.search-form-wrapper');
  const main = document.querySelector('main');
  if (wrapper && main) {
    const section = wrapper.closest('.section');
    main.insertBefore(wrapper, section);

    // Toggle is-stuck class for width expansion only.
    // CSS handles sticky positioning. JS detects when the wrapper
    // is pinned to top: 0 so we can expand it to 100vw and remove rounding.
    let ticking = false;
    const update = () => {
      wrapper.classList.toggle('is-stuck', wrapper.getBoundingClientRect().top <= 0);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(update));
  }
}
