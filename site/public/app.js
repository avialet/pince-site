/* Lien de telechargement lu depuis la derniere version publiee sur GitHub (repli : page des versions). */
(function () {
  'use strict';

  var RELEASES = 'https://github.com/avialet/pince/releases/latest';
  var API = 'https://api.github.com/repos/avialet/pince/releases/latest';
  var ASSET = /^Pince-\d+\.\d+\.\d+\.dmg$/;
  var STORE = 'pince-release';
  var links = document.querySelectorAll('[data-download]');
  var labels = document.querySelectorAll('[data-download-label]');
  var metas = document.querySelectorAll('[data-download-meta]');

  function apply(info) {
    links.forEach(function (a) { a.href = info.url; });
    labels.forEach(function (l) { l.textContent = 'Télécharger Pince ' + info.version; });
    metas.forEach(function (m) {
      m.textContent = 'Version ' + info.version + ' · ' + info.size + ' · Apple Silicon · macOS 26 Tahoe ou plus récent';
    });
  }

  function fromRelease(r) {
    var asset = (r.assets || []).filter(function (a) { return ASSET.test(a.name); })[0];
    if (!asset) return null;
    return {
      version: String(r.tag_name || '').replace(/^v/, ''),
      url: asset.browser_download_url,
      size: Math.max(1, Math.round(asset.size / 1048576)) + ' Mo'
    };
  }

  try {
    var cached = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (cached && Date.now() - cached.at < 3600e3) apply(cached.info);
  } catch (e) { /* stockage indisponible */ }

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (r) {
      var info = fromRelease(r);
      if (!info) return;
      apply(info);
      try { sessionStorage.setItem(STORE, JSON.stringify({ at: Date.now(), info: info })); } catch (e) { /* ignore */ }
    })
    .catch(function () {
      // Repli : les liens hors ancre pointent vers la page des versions.
      links.forEach(function (a) {
        if (a.getAttribute('href').charAt(0) !== '#') a.href = RELEASES;
      });
    });
})();
