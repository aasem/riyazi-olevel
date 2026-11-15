// Script choice (Nastaliq or Naskh). Order: ?script= in the URL, then the saved choice, then Nastaliq.
(function () {
  var KEY = 'riyazi-script';
  var allowed = ['nastaliq', 'naskh'];

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: choice lasts for this page only */ }
  }
  function fromUrl() {
    var m = /[?&]script=([a-z]+)/.exec(location.search);
    return m ? m[1] : null;
  }
  function apply(v) {
    if (allowed.indexOf(v) < 0) v = 'nastaliq';
    document.documentElement.setAttribute('data-script', v);
    var buttons = document.querySelectorAll('[data-set-script]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-set-script') === v ? 'true' : 'false');
    }
    var pdf = document.querySelector('[data-pdf]');
    if (pdf) pdf.setAttribute('href', pdf.getAttribute('data-pdf') + '-' + v + '.pdf');
    return v;
  }

  apply(fromUrl() || saved() || 'nastaliq');

  document.addEventListener('DOMContentLoaded', function () {
    apply(document.documentElement.getAttribute('data-script'));
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-set-script]') : null;
      if (!b) return;
      save(apply(b.getAttribute('data-set-script')));
    });
  });
})();
