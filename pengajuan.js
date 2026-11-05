(() => {
  'use strict';
  const { readLoans, writeLoans, getSession, refreshBadge } = window.KK;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const me = getSession(), list = $('#loanList'), empty = $('#empty');
  if (!me) {
    $('#lead').hidden = true;
    empty.hidden = false;
    empty.innerHTML = '<p>Masuk dulu untuk melihat pengajuanmu.</p><a class="btn btn--primary" href="masuk.html">Masuk</a>';
    return;
  }
  if (me.role === 'admin') {
    $('#lead').hidden = true;
    empty.hidden = false;
    empty.innerHTML = '<p>Kamu masuk sebagai admin. Kelola pengajuan siswa di panel admin.</p><a class="btn btn--primary" href="admin.html">Buka Panel Admin</a>';
    return;
  }

  const all = readLoans();
  const mine = all.filter(l => l.user && l.user.email === me.email).sort((a, b) => b.created.localeCompare(a.created));

  const MSG = {
    menunggu: (l) => 'Menunggu persetujuan pengelola. Kamu akan mendapat notifikasi saat ada keputusan.',
    disetujui: (l) => `Pengajuanmu disetujui. Ambil barang sesuai jadwal dan kembalikan paling lambat ${fmt(l.end)}.`,
    ditolak: (l) => 'Pengajuan ditolak.' + (l.reason ? ' Alasan: ' + l.reason : ''),
    dikembalikan: () => 'Barang sudah dikembalikan. Terima kasih!'
  };

  list.innerHTML = mine.map(l => `
    <article class="loan ${l.unread ? 'is-new' : ''}">
      <div class="loan__top">
        <div><h3>${esc(l.item)}</h3>
          <p class="loan__meta">${esc(l.qty)} unit &middot; ${fmt(l.start)} sampai ${fmt(l.end)}</p></div>
        <div>${l.unread ? '<span class="tag-new">Baru</span> ' : ''}<span class="badge badge--${esc(l.status)}">${esc(l.status)}</span></div>
      </div>
      ${l.note ? `<p class="loan__meta">Keperluan: ${esc(l.note)}</p>` : ''}
      <p class="loan__status loan__status--${esc(l.status)}">${esc((MSG[l.status] || (() => ''))(l))}</p>
    </article>`).join('');

  if (!mine.length) {
    empty.hidden = false;
    empty.innerHTML = '<p>Belum ada pengajuan. Cari barang yang kamu butuhkan di katalog.</p><a class="btn btn--primary" href="katalog.html">Buka Katalog</a>';
  }

  /* Tandai sudah dibaca (sorotan "Baru" tetap terlihat di halaman ini) */
  if (mine.some(l => l.unread)) {
    const fresh = readLoans();
    fresh.forEach(l => { if (l.user && l.user.email === me.email) l.unread = false; });
    writeLoans(fresh);
    document.querySelectorAll('.toast').forEach(t => t.remove());
    refreshBadge();
  }
})();
