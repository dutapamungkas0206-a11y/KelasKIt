(() => {
  'use strict';
  const { ICONS, CATEGORIES, ITEMS, cardHTML, catLabel } = window.KK;
  const state = { cat: 'semua' };
  const $ = (s) => document.querySelector(s);
  const chips = $('#chips'), grid = $('#grid'), listTitle = $('#listTitle'), seeAll = $('#seeAll');

  function renderChips() {
    const all = [{ id: 'semua', label: 'Semua', count: 48, icon: 'box' }, ...CATEGORIES];
    chips.innerHTML = all.map(c => `
      <button class="chip ${c.id === state.cat ? 'is-active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${c.id === state.cat}">
        <span class="chip__icon">${ICONS[c.icon]}</span>${c.label} <small>${c.count}</small>
      </button>`).join('');
  }
  function renderCards() {
    const list = ITEMS.filter(i => state.cat === 'semua' || i.cat === state.cat).slice(0, 4);
    grid.innerHTML = list.map(cardHTML).join('');
    listTitle.textContent = state.cat === 'semua' ? 'Sering dipinjam' : catLabel(state.cat);
    seeAll.href = 'katalog.html' + (state.cat === 'semua' ? '' : '?cat=' + state.cat);
  }
  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.dataset.cat; renderChips(); renderCards();
  });

  const goSearch = (q) => { location.href = 'katalog.html' + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : ''); };
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); goSearch($('#searchInput').value); });
  document.querySelectorAll('.popular button').forEach(b => b.addEventListener('click', () => goSearch(b.dataset.q)));

  /* Saran barang langsung di bawah kolom cari */
  const box = $('#suggest'), input = $('#searchInput');
  const hide = () => { box.hidden = true; };
  function suggest() {
    const q = input.value.trim().toLowerCase();
    if (!q) return hide();
    const hits = ITEMS.filter(i => (i.name + ' ' + catLabel(i.cat)).toLowerCase().includes(q));
    box.innerHTML = hits.length
      ? hits.slice(0, 5).map(i => `<button type="button" class="suggest__item" data-item="${i.name}"><span>${i.name}</span><small>${i.stock ? i.stock + ' unit tersedia' : 'Sedang dipinjam'}</small></button>`).join('')
        + `<a class="suggest__more" href="katalog.html?q=${encodeURIComponent(input.value.trim())}">Lihat semua hasil (${hits.length})</a>`
      : '<p class="suggest__none">Barang tidak ditemukan. Coba kata lain.</p>';
    box.hidden = false;
  }
  input.addEventListener('input', suggest);
  input.addEventListener('focus', suggest);
  document.addEventListener('click', e => { if (!e.target.closest('#searchForm')) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

  renderChips(); renderCards();
})();
