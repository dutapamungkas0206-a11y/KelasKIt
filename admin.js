(() => {
  'use strict';
  const { ITEMS, readLoans, writeLoans, getSession, catLabel, applyStock } = window.KK;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Penjaga halaman. Catatan: ini hanya di sisi browser, belum keamanan sungguhan. */
  const me = getSession();
  if (!me || me.role !== 'admin') { $('#denied').hidden = false; return; }
  $('#adminMain').hidden = false;

  const STATUS = [['menunggu', 'Menunggu'], ['disetujui', 'Disetujui'], ['dikembalikan', 'Dikembalikan'], ['ditolak', 'Ditolak'], ['semua', 'Semua']];
  let filter = 'menunggu', rejectId = null;
  const fmt = (s) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const say = (t, ok) => { const m = $('#adminMsg'); m.textContent = t; m.classList.toggle('ok', !!ok); };

  function update(id, patch) {
    const all = readLoans();
    const loan = all.find(l => l.id === id);
    if (!loan) return false;
    Object.assign(loan, patch);
    if (!writeLoans(all)) { say('Gagal menyimpan perubahan.'); return false; }
    applyStock(); render();
    return true;
  }

  function render() {
    const all = readLoans().sort((a, b) => b.created.localeCompare(a.created));
    const count = (s) => s === 'semua' ? all.length : all.filter(l => l.status === s).length;

    $('#stats').innerHTML = [['menunggu', 'Menunggu persetujuan'], ['disetujui', 'Sedang dipinjam'], ['dikembalikan', 'Sudah dikembalikan'], ['ditolak', 'Ditolak']]
      .map(([s, label]) => `<div class="stat-card"><b>${count(s)}</b><span>${label}</span></div>`).join('');

    $('#statusChips').innerHTML = STATUS.map(([s, label]) =>
      `<button type="button" class="chip chip--plain ${s === filter ? 'is-active' : ''}" data-status="${s}" role="tab" aria-selected="${s === filter}">${label} <small>${count(s)}</small></button>`).join('');

    const rows = all.filter(l => filter === 'semua' || l.status === filter);
    $('#loanRows').innerHTML = rows.map(l => {
      let act = '<span class="muted">-</span>';
      if (l.status === 'menunggu') act = `<div class="actions"><button type="button" class="btn-sm btn-ok" data-act="approve" data-id="${esc(l.id)}">Setujui</button><button type="button" class="btn-sm btn-no" data-act="reject" data-id="${esc(l.id)}">Tolak</button></div>`;
      if (l.status === 'disetujui') act = `<button type="button" class="btn-sm btn-ret" data-act="return" data-id="${esc(l.id)}">Tandai dikembalikan</button>`;
      const extra = l.status === 'ditolak' && l.reason ? `<small>Alasan: ${esc(l.reason)}</small>` : '';
      return `<tr>
        <td><strong>${esc(l.user.name)}</strong>${l.user.role === 'guru' ? ' <span class="tag-role">Guru</span>' : ''}<small>${esc(l.user.kelas)}${l.user.kelas ? ' &middot; ' : ''}${esc(l.user.email)}</small></td>
        <td>${esc(l.item)}<small>${esc(l.qty)} unit</small></td>
        <td>${fmt(l.start)}<small>sampai ${fmt(l.end)}</small></td>
        <td>${esc(l.note) || '<span class="muted">-</span>'}</td>
        <td><span class="badge badge--${esc(l.status)}">${esc(l.status)}</span>${extra}</td>
        <td>${act}</td></tr>`;
    }).join('');
    $('#loanEmpty').hidden = rows.length > 0;

    $('#invRows').innerHTML = ITEMS.map(i => `<tr>
      <td>${esc(i.name)}</td><td>${esc(catLabel(i.cat))}</td><td>${i.total}</td><td>${i.total - i.stock}</td>
      <td><strong>${i.stock}</strong></td></tr>`).join('');
  }

  $('#statusChips').addEventListener('click', e => {
    const b = e.target.closest('[data-status]'); if (!b) return;
    filter = b.dataset.status; say(''); render();
  });

  $('#loanRows').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.dataset.id, loan = readLoans().find(l => l.id === id);
    if (!loan) return;
    say('');
    if (b.dataset.act === 'approve') {
      const item = ITEMS.find(i => i.name === loan.item);
      if (!item || loan.qty > item.stock) { say(`Stok tidak cukup untuk ${loan.item}. Tersedia ${item ? item.stock : 0} unit.`); return; }
      if (update(id, { status: 'disetujui', decided: new Date().toISOString(), unread: true })) say(`Pengajuan ${loan.user.name} disetujui.`, true);
    }
    if (b.dataset.act === 'reject') {
      rejectId = id;
      $('#rejectInfo').textContent = `${loan.user.name} - ${loan.item} (${loan.qty} unit)`;
      $('#reason').value = '';
      $('#rejectDlg').showModal();
    }
    if (b.dataset.act === 'return') {
      if (update(id, { status: 'dikembalikan', returned: new Date().toISOString() })) say(`${loan.item} dari ${loan.user.name} ditandai sudah dikembalikan.`, true);
    }
  });

  $('#rejectForm').addEventListener('submit', e => {
    e.preventDefault();
    if (update(rejectId, { status: 'ditolak', reason: $('#reason').value.trim(), decided: new Date().toISOString(), unread: true })) say('Pengajuan ditolak.', true);
    $('#rejectDlg').close();
  });
  $('#rejectCancel').addEventListener('click', () => $('#rejectDlg').close());

  $('#seedBtn').addEventListener('click', () => {
    const day = (n) => new Date(Date.now() + n * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    const mk = (i, name, kelas, item, qty, a, b, note) => ({ id: 'C' + Date.now() + i, item, qty, start: day(a), end: day(b), note,
      user: { name, email: name.split(' ')[0].toLowerCase() + '@contoh.id', kelas }, status: 'menunggu', created: new Date(Date.now() + i).toISOString() });
    const all = readLoans();
    all.push(
      mk(1, 'Rani Putri', 'XI IPA 2', 'Proyektor Epson EB-X06', 1, 1, 2, 'Presentasi kelompok pelajaran IPA'),
      mk(2, 'Dimas Pratama', 'X IPS 1', 'Kamera Canon EOS 1500D', 1, 2, 3, 'Dokumentasi kegiatan ekstrakurikuler'),
      mk(3, 'Salsa Amelia', 'XII IPA 1', 'Laptop ASUS ExpertBook', 2, 1, 3, 'Lomba karya ilmiah'));
    writeLoans(all); say('3 data contoh ditambahkan.', true); render();
  });

  $('#clearBtn').addEventListener('click', () => {
    if (!confirm('Hapus semua data pengajuan? Stok akan kembali ke jumlah awal.')) return;
    writeLoans([]); applyStock(); say('Semua pengajuan dihapus.', true); render();
  });

  render();
})();
