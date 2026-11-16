// Builds a self-contained slide deck (one slide per test case, with evidence screenshots)
// from a QA run folder. Usage: node documents/qa/build-slides.js documents/qa/<YYYY-MM-DD>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node documents/qa/build-slides.js documents/qa/<YYYY-MM-DD>');
  process.exit(1);
}
const md = fs.readFileSync(path.join(dir, 'test-cases.md'), 'utf8');
const evidenceDir = path.join(dir, 'evidence');
const runDate = path.basename(dir);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

// Evidence cell -> existing file names. Supports "S1-01-1/2/3.jpg", "S2-01-1…10.jpg",
// "S6-05-*.jpg" and plain names like "S2-01-10.jpg".
const allEvidence = fs.existsSync(evidenceDir) ? fs.readdirSync(evidenceDir).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })) : [];
function evidenceFiles(cell) {
  const out = [];
  for (const m of cell.matchAll(/(S\d+[a-z]?-\d+)-(\d+)…(\d+)\.jpg/g)) {
    for (let n = +m[2]; n <= +m[3]; n++) out.push(`${m[1]}-${n}.jpg`);
  }
  for (const m of cell.matchAll(/(S\d+[a-z]?-\d+)-\*\.jpg/g)) {
    out.push(...allEvidence.filter((f) => f.startsWith(m[1] + '-')));
  }
  for (const m of cell.matchAll(/(S\d+[a-z]?-\d+)-([\d/]+)\.jpg/g)) {
    for (const n of m[2].split('/')) out.push(`${m[1]}-${n}.jpg`);
  }
  return [...new Set(out)].filter((f) => fs.existsSync(path.join(evidenceDir, f)));
}

const STATUS = {
  '✅': ['pass', 'Đạt'],
  '❌': ['fail', 'Lỗi'],
  '⛔': ['blocked', 'Bị chặn'],
  '⏭': ['notrun', 'Chưa chạy'],
};

// Parse sections and case rows
const suites = [];
let current = null;
for (const line of md.split('\n')) {
  if (line.startsWith('## ')) {
    current = { title: line.slice(3).trim(), intro: '', cases: [] };
    suites.push(current);
    continue;
  }
  if (!current) continue;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.length >= 12 && /^S\d+-\d+$/.test(cells[0])) {
    const [id, , title, prio, pre, data, steps, expected, actual, status, evidence, notes] = cells;
    const key = Object.keys(STATUS).find((k) => status.includes(k));
    current.cases.push({ id, title, prio, pre, data, steps, expected, actual, status: STATUS[key] || ['notrun', status], evidence, notes });
  } else if (line.trim() && !line.startsWith('|') && !current.cases.length) {
    current.intro += (current.intro ? ' ' : '') + line.trim();
  }
}
const all = suites.flatMap((s) => s.cases);
const count = (k) => all.filter((c) => c.status[0] === k).length;
const totals = { total: all.length, pass: count('pass'), fail: count('fail'), blocked: count('blocked'), notrun: count('notrun') };

const stepsHtml = (s) => {
  const parts = s.split(/\s*(?=\b\d+\.\s)/).map((p) => p.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  return parts.length > 1 ? '<ol>' + parts.map((p) => `<li>${inline(p)}</li>`).join('') + '</ol>' : `<p>${inline(s)}</p>`;
};

const slides = [];
slides.push(`<section class="slide cover">
  <p class="kicker">web-travel · Kiểm thử</p>
  <h1>Test case & bằng chứng</h1>
  <p class="sub">Lượt ${runDate} · ${totals.total} tình huống · mỗi trang là 1 tình huống, kèm ảnh màn hình thật</p>
  <div class="kpis">
    <div><b>${totals.pass}</b><span>✅ Đạt</span></div><div class="f"><b>${totals.fail}</b><span>❌ Lỗi</span></div>
    <div class="b"><b>${totals.blocked}</b><span>⛔ Bị chặn</span></div><div class="n"><b>${totals.notrun}</b><span>⏭ Chưa chạy</span></div>
  </div>
  <table class="sum"><tr><th>Phần</th><th>Số case</th><th>Đạt</th><th>Lỗi</th><th>Chặn / chưa chạy</th></tr>
  ${suites
    .filter((s) => s.cases.length)
    .map((s) => {
      const c = (k) => s.cases.filter((x) => x.status[0] === k).length;
      return `<tr><td>${inline(s.title)}</td><td>${s.cases.length}</td><td>${c('pass')}</td><td>${c('fail')}</td><td>${c('blocked') + c('notrun')}</td></tr>`;
    })
    .join('')}</table>
  <p class="hint">← / → để chuyển trang · bấm ảnh để phóng to · nút "Chỉ xem lỗi" ở góc dưới</p>
</section>`);

for (const s of suites) {
  if (!s.cases.length) continue;
  slides.push(`<section class="slide divider"><h2>${inline(s.title)}</h2>${s.intro ? `<p>${inline(s.intro)}</p>` : ''}<p class="sub">${s.cases.length} tình huống</p></section>`);
  for (const c of s.cases) {
    const imgs = evidenceFiles(c.evidence);
    slides.push(`<section class="slide case ${c.status[0]}" data-status="${c.status[0]}">
  <header><span class="id">${c.id}</span><h2>${inline(c.title)}</h2><span class="pill ${c.status[0]}">${c.status[1]}</span><span class="prio">${esc(c.prio)}</span></header>
  <div class="grid ${imgs.length ? '' : 'noimg'}">
    <div class="text">
      ${c.pre && c.pre !== '—' ? `<h4>Điều kiện trước</h4><p>${inline(c.pre)}${c.data && c.data !== '—' ? ` · dữ liệu ${inline(c.data)}` : ''}</p>` : ''}
      <h4>Các bước</h4>${stepsHtml(c.steps)}
      <h4>Mong đợi</h4><p>${inline(c.expected)}</p>
      <h4>Thực tế</h4><p class="actual">${inline(c.actual)}</p>
      ${c.notes && c.notes !== '—' ? `<h4>Ghi chú</h4><p>${inline(c.notes)}</p>` : ''}
    </div>
    ${imgs.length ? `<div class="shots">${imgs.map((f) => `<figure><img loading="lazy" src="evidence/${f}" alt="${c.id}"><figcaption>${f}</figcaption></figure>`).join('')}</div>` : ''}
  </div>
</section>`);
  }
}

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Test case & bằng chứng · ${runDate}</title>
<style>
  :root { --g:#0f6e56; --r:#d93025; --y:#e8a400; --n:#8a8f98; --bg:#f5f6f4; --ink:#1d2321; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; background: #1d2321; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); }
  .slide { display: none; position: absolute; inset: 16px; background: var(--bg); border-radius: 18px; padding: 28px 36px; overflow: auto; }
  .slide.on { display: block; }
  .cover h1 { font-size: 44px; margin: 6px 0; color: var(--g); }
  .kicker { text-transform: uppercase; letter-spacing: .12em; color: var(--n); margin: 0; font-weight: 600; }
  .sub { color: #555; font-size: 18px; }
  .hint { color: var(--n); margin-top: 18px; }
  .kpis { display: flex; gap: 14px; margin: 18px 0; }
  .kpis div { background: #fff; border-radius: 14px; padding: 14px 22px; border-top: 5px solid var(--g); min-width: 130px; }
  .kpis div.f { border-color: var(--r); } .kpis div.b { border-color: var(--y); } .kpis div.n { border-color: var(--n); }
  .kpis b { font-size: 34px; display: block; } .kpis span { color: #555; }
  table.sum { border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
  table.sum th, table.sum td { padding: 7px 14px; border-bottom: 1px solid #eee; text-align: left; font-size: 15px; }
  table.sum th { background: #e9efec; }
  .divider { display: none; text-align: center; padding-top: 22vh; }
  .divider.on { display: block; }
  .divider h2 { font-size: 40px; color: var(--g); margin: 0 auto 12px; max-width: 900px; }
  .divider p { max-width: 900px; margin: 8px auto; color: #444; font-size: 17px; }
  .case header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #e3e6e3; padding-bottom: 12px; margin-bottom: 14px; }
  .case header h2 { margin: 0; font-size: 26px; flex: 1; }
  .id { background: var(--ink); color: #fff; border-radius: 8px; padding: 4px 10px; font-weight: 700; font-family: ui-monospace, monospace; }
  .pill { border-radius: 999px; padding: 5px 14px; font-weight: 700; color: #fff; }
  .pill.pass { background: var(--g); } .pill.fail { background: var(--r); } .pill.blocked { background: var(--y); } .pill.notrun { background: var(--n); }
  .prio { color: var(--n); font-weight: 700; }
  .case.fail { box-shadow: inset 6px 0 0 var(--r); } .case.pass { box-shadow: inset 6px 0 0 var(--g); } .case.blocked { box-shadow: inset 6px 0 0 var(--y); }
  .grid { display: grid; grid-template-columns: minmax(320px, 1fr) 1.4fr; gap: 26px; }
  .grid.noimg { grid-template-columns: 1fr; max-width: 900px; }
  .text h4 { margin: 14px 0 4px; text-transform: uppercase; font-size: 12px; letter-spacing: .1em; color: var(--n); }
  .text p, .text li { font-size: 16px; line-height: 1.5; margin: 0; }
  .text ol { margin: 0; padding-left: 22px; }
  .case.fail .actual { color: var(--r); font-weight: 600; }
  code { background: #e9ecea; padding: 1px 5px; border-radius: 5px; font-size: .9em; }
  .shots { display: flex; flex-wrap: wrap; gap: 14px; align-content: flex-start; }
  .shots figure { flex: 0 1 calc(33.3% - 10px); min-width: 0; margin: 0; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
  .shots img { display: block; margin: 0 auto; max-height: 58vh; max-width: 100%; border-radius: 8px; cursor: zoom-in; }
  .shots figcaption { font-size: 12px; color: var(--n); text-align: center; margin-top: 4px; font-family: ui-monospace, monospace; }
  nav { position: fixed; bottom: 22px; right: 30px; display: flex; gap: 8px; align-items: center; z-index: 5; }
  nav button { border: 0; border-radius: 10px; padding: 8px 14px; background: var(--ink); color: #fff; font-weight: 600; cursor: pointer; }
  nav button.on { background: var(--r); }
  nav span { background: #fff; border-radius: 10px; padding: 8px 12px; font-weight: 600; }
  .lb { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.88); z-index: 9; align-items: center; justify-content: center; cursor: zoom-out; }
  .lb.on { display: flex; } .lb img { max-width: 96vw; max-height: 96vh; border-radius: 8px; }
</style>
</head>
<body>
${slides.join('\n')}
<nav><button id="fail">Chỉ xem lỗi</button><button id="prev">←</button><span id="pos"></span><button id="next">→</button></nav>
<div class="lb" id="lb"><img alt="" /></div>
<script>
  var all = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var onlyFail = false, i = 0;
  function list() { return onlyFail ? all.filter(function (s) { return s.classList.contains('cover') || s.dataset.status === 'fail'; }) : all; }
  function show(n) {
    var l = list(); i = Math.max(0, Math.min(n, l.length - 1));
    all.forEach(function (s) { s.classList.remove('on'); }); l[i].classList.add('on'); l[i].scrollTop = 0;
    document.getElementById('pos').textContent = (i + 1) + ' / ' + l.length;
  }
  document.getElementById('prev').onclick = function () { show(i - 1); };
  document.getElementById('next').onclick = function () { show(i + 1); };
  document.getElementById('fail').onclick = function () { onlyFail = !onlyFail; this.classList.toggle('on', onlyFail); show(0); };
  document.addEventListener('keydown', function (e) {
    if (document.getElementById('lb').classList.contains('on')) { if (e.key === 'Escape') document.getElementById('lb').classList.remove('on'); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') show(i + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(i - 1);
    if (e.key === 'Home') show(0);
  });
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.shots img'); var lb = document.getElementById('lb');
    if (img) { lb.querySelector('img').src = img.src; lb.classList.add('on'); return; }
    if (e.target.closest('.lb')) lb.classList.remove('on');
  });
  show(0);
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(dir, 'slides.html'), html);
const noEvidence = all.filter((c) => !evidenceFiles(c.evidence).length).map((c) => c.id);
console.log(`slides.html: ${all.length} cases, ${slides.length} slides; cases without evidence: ${noEvidence.join(', ') || 'none'}`);
