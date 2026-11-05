(() => {
  'use strict';
  const { ICONS, CATEGORIES, ITEMS, cardHTML, catLabel } = window.KK;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    cat: CATEGORIES.some(c => c.id === params.get('cat')) ? params.get('cat') : 'semua',
    avail: false, sort: 'nama'
  };
  const chips = $('#chips'), grid = $('#grid'), count = $('#count'), empty = $('#empty'), input = $('#searchInput');
  input.value = state.q;

  function renderChips() {
    const all = [{ id: 'semua', label: 'Semua', icon: 'box' }, ...CATEGORIES];
    chips.innerHTML = all.map(c => {
      const n = c.id === 'semua' ? ITEMS.length : ITEMS.filter(i => i.cat === c.id).length;
      return `<button class="chip ${c.id === state.cat ? 'is-active' : ''}" data-cat="${c.id}" role="tab" aria-selected="${c.id === state.cat}">
        <span class="chip__icon">${ICONS[c.icon]}</span>${c.label} <small>${n}</small></button>`;
    }).join('');
  }

  function render() {
    const q = state.q.trim().toLowerCase();
    const list = ITEMS.filter(i =>
      (state.cat === 'semua' || i.cat === state.cat) &&
      (!state.avail || i.stock > 0) &&
      (!q || (i.name + ' ' + catLabel(i.cat)).toLowerCase().includes(q)));
    const sorters = {
      nama: (a, b) => a.name.localeCompare(b.name, 'id'),
      stok: (a, b) => b.stock - a.stock,
      durasi: (a, b) => b.days - a.days
    };
    list.sort(sorters[state.sort]);
    grid.innerHTML = list.map(cardHTML).join('');
    count.textContent = `${list.length} barang ditemukan` + (state.q.trim() ? ` untuk "${state.q.trim()}"` : '');
    empty.hidden = list.length > 0;

    const p = new URLSearchParams();
    if (state.q.trim()) p.set('q', state.q.trim());
    if (state.cat !== 'semua') p.set('cat', state.cat);
    try { history.replaceState(null, '', p.toString() ? '?' + p : location.pathname); } catch {}
  }

  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.dataset.cat; renderChips(); render();
  });
  // Saat mencari, cari di semua kategori (bukan hanya kategori yang sedang dipilih)
  function doSearch() {
    state.q = input.value;
    if (state.q.trim() && state.cat !== 'semua') { state.cat = 'semua'; renderChips(); }
    render();
  }
  input.addEventListener('input', doSearch);
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); doSearch(); });
  $('#onlyAvail').addEventListener('change', e => { state.avail = e.target.checked; render(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('#reset').addEventListener('click', () => {
    Object.assign(state, { q: '', cat: 'semua', avail: false, sort: 'nama' });
    input.value = ''; $('#onlyAvail').checked = false; $('#sort').value = 'nama';
    renderChips(); render();
  });

  renderChips(); render();
})();
