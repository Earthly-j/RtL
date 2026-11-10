(function () {
  var css = document.createElement('style');
  css.textContent =
      css.textContent =
    '.rtl-run{direction:rtl!important;unicode-bidi:bidi-override!important}' +
    '.rtl-ltr{display:inline-block!important;direction:ltr!important;unicode-bidi:bidi-override!important}' +
    '*:has(> .rtl-run, > :is(a,span,b,strong,em,i,u,small,font,mark,label) > .rtl-run){text-align:right!important}';
  document.head.appendChild(css);

  var SKIP = 'script, style, noscript, textarea, input, .rtl-run';
  var W = 'A-Za-z0-9\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A';
  var LATIN = new RegExp('[' + W + ']+(?:[ .,:\'\\-\\/][' + W + ']+)*', 'g');
  var NON_ASCII = /[^\x00-\x7F]/;

  function wrapTextNode(n) {
    var p = n.parentNode;
    if (!p || p.nodeType !== 1 || p.closest(SKIP) || p.isContentEditable) return;
    var text = n.nodeValue;
    var lead = text.match(/^\s*/)[0];
    var trail = text.match(/\s*$/)[0];
    var core = text.slice(lead.length, text.length - trail.length);
    if (!NON_ASCII.test(core)) return;

    var run = document.createElement('span');
    run.className = 'rtl-run';
    var last = 0, m;
    LATIN.lastIndex = 0;
    while ((m = LATIN.exec(core)) !== null) {
      if (m.index > last) run.appendChild(document.createTextNode(core.slice(last, m.index)));
      var s = document.createElement('span');
      s.className = 'rtl-ltr';
      s.textContent = m[0];
      run.appendChild(s);
      last = m.index + m[0].length;
    }
    if (last < core.length) run.appendChild(document.createTextNode(core.slice(last)));

    var frag = document.createDocumentFragment();
    if (lead) frag.appendChild(document.createTextNode(lead));
    frag.appendChild(run);
    if (trail) frag.appendChild(document.createTextNode(trail));
    p.replaceChild(frag, n);
  }

  function scan(root) {
    if (root.nodeType === 3) { wrapTextNode(root); return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(wrapTextNode);
  }

  scan(document.body);

  new MutationObserver(function (muts) {
    muts.forEach(function (mu) {
      mu.addedNodes.forEach(scan);
      if (mu.type === 'characterData') wrapTextNode(mu.target);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
