/* Renders the guide from window.GUIDE (see the two HTML pages). No dependencies. */
(function () {
  var g = window.GUIDE;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  // **text** → highlighted button name
  var rich = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); };

  var menu = document.getElementById('menu');
  var main = document.getElementById('main');

  g.journeys.forEach(function (j, ji) {
    var id = 'j' + (ji + 1);
    var a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = (ji + 1) + '. ' + j.title;
    menu.appendChild(a);

    var sec = document.createElement('section');
    sec.className = 'journey';
    sec.id = id;
    var html = '<h2>' + (ji + 1) + '. ' + esc(j.title) + '</h2><p class="goal">' + rich(j.goal) + '</p><div class="flow">';
    j.steps.forEach(function (s, si) {
      if (si) html += '<div class="arrow" aria-hidden="true">➜</div>';
      html +=
        '<article class="step ' + (g.frame || '') + '" style="--w:' + (g.width || 300) + 'px">' +
        '<div class="head"><span class="num">' + (si + 1) + '</span>' + esc(s.title) + '</div>' +
        (s.img ? '<div class="shot"><img loading="lazy" src="' + esc(s.img) + '" alt="' + esc(s.title) + '"></div>' : '') +
        '<p class="do">' + rich(s.do) + '</p>' +
        (s.result ? '<p class="result">' + rich(s.result) + '</p>' : '') +
        '</article>';
    });
    html += '</div>';
    (j.notes || []).forEach(function (n) {
      html += '<div class="note ' + (n.type || '') + '">' + rich(n.text) + '</div>';
    });
    sec.innerHTML = html;
    main.appendChild(sec);
  });

  // click a screenshot to enlarge
  var lb = document.getElementById('lb');
  var lbImg = lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.shot img');
    if (img) { lbImg.src = img.src; lb.classList.add('on'); return; }
    if (e.target.closest('.lb')) lb.classList.remove('on');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
})();
