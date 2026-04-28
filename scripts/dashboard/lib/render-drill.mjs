/**
 * render-drill.mjs — Shared drill gallery renderer
 *
 * Produces a self-contained HTML string (CSS + JS + data inlined) suitable
 * for pasting into a Wix HTML Embed element on a Members-Only page.
 *
 * View-only: filter, search, watch, open Instagram, download from Drive.
 * No planner, no edit, no delete — the dashboard remains the curation UI.
 *
 * Kept intentionally independent of rugby-web.mjs so the dashboard and the
 * static export can evolve separately without blocking each other.
 */

export const GALLERY_CSS = `
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f3ee;
  color: #2a2a2a;
  line-height: 1.45;
}
.brc-gallery { max-width: 1400px; margin: 0 auto; padding: 16px 20px 48px; }
.brc-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.brc-header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #2d5016; }
.brc-header .meta { font-size: 12px; color: #7b7870; }

.brc-filters {
  background: #fff;
  border: 1px solid #e0ddd4;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
  display: grid;
  grid-template-columns: 1fr 180px 180px 180px;
  gap: 10px;
  align-items: end;
}
.brc-filters .fg { display: flex; flex-direction: column; gap: 4px; }
.brc-filters label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #7b7870; font-weight: 600; }
.brc-filters input, .brc-filters select {
  font: inherit;
  padding: 8px 10px;
  border: 1px solid #d6d2c6;
  border-radius: 6px;
  background: #fafaf6;
  color: #2a2a2a;
  min-height: 38px;
}
.brc-filters input:focus, .brc-filters select:focus { outline: 2px solid #77a44a; outline-offset: -1px; }

.brc-age-tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.brc-age-tab {
  padding: 6px 14px;
  border: 1px solid #d6d2c6;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  color: #4a4a4a;
}
.brc-age-tab.active { background: #2d5016; color: #fff; border-color: #2d5016; }

.brc-stats { font-size: 13px; color: #7b7870; margin-bottom: 12px; }

.brc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.brc-card {
  background: #fff;
  border: 1px solid #e0ddd4;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s;
}
.brc-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.brc-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #ede9df;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.brc-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.brc-thumb-placeholder {
  font-size: 42px;
  color: #b5ae9c;
}
.brc-thumb-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.15);
  color: #fff;
  font-size: 48px;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.brc-thumb:hover .brc-thumb-play { opacity: 1; }

.brc-body { padding: 12px 14px 8px; flex: 1; }
.brc-category { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6a8a3a; font-weight: 600; }
.brc-title { font-size: 16px; font-weight: 600; margin: 4px 0 6px; color: #2a2a2a; }
.brc-cue { font-size: 13px; color: #4a4a4a; margin-bottom: 8px; min-height: 2.8em; }
.brc-badges { display: flex; flex-wrap: wrap; gap: 4px; }
.brc-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0eee6;
  color: #4a4a4a;
}
.brc-badge-age { background: #e4ecd8; color: #3a5a1a; }
.brc-badge-beginner { background: #d8ecd8; color: #2d5016; }
.brc-badge-intermediate { background: #f5e8c8; color: #6a4a10; }
.brc-badge-advanced { background: #f5d8d8; color: #7a2a2a; }
.brc-badge-video { background: #e8f0e8; color: #2d5016; }

.brc-actions {
  display: flex;
  gap: 6px;
  padding: 8px 12px 12px;
  flex-wrap: wrap;
  border-top: 1px solid #f0eee6;
  background: #fafaf6;
}
.brc-action {
  font: inherit;
  font-size: 13px;
  padding: 6px 10px;
  border: 1px solid #d6d2c6;
  background: #fff;
  color: #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.brc-action:hover { background: #f0eee6; }
.brc-action.secondary { background: #fafaf6; color: #4a4a4a; }
.brc-action:disabled { opacity: 0.5; cursor: not-allowed; }

.brc-empty {
  text-align: center;
  padding: 64px 24px;
  color: #7b7870;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #d6d2c6;
}
.brc-empty h2 { margin: 0 0 8px; font-weight: 500; color: #4a4a4a; }

.brc-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.brc-modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  line-height: 1;
}
.brc-modal-inner {
  background: #1a1a1a;
  border-radius: 12px;
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.brc-modal-player, .brc-modal-iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border: none;
  display: block;
}
.brc-modal-info { padding: 14px 18px; color: #f0eee6; }
.brc-modal-info h2 { margin: 0 0 4px; font-size: 18px; font-weight: 500; }
.brc-modal-info p { margin: 0; font-size: 14px; color: #c0bcae; }

@media (max-width: 820px) {
  .brc-filters { grid-template-columns: 1fr 1fr; }
  .brc-filters .fg-search { grid-column: 1 / -1; }
}
@media (max-width: 520px) {
  .brc-filters { grid-template-columns: 1fr; }
  .brc-grid { grid-template-columns: 1fr; }
}
`;

export const GALLERY_JS = `
(function() {
  var DRILLS = window.__BRC_DRILLS__ || [];
  var CATEGORIES = window.__BRC_CATEGORIES__ || [];
  var AGE_GROUPS = window.__BRC_AGE_GROUPS__ || [];

  var state = { cat: 'All', diff: 'All', q: '', age: 'All' };

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function getDriveFileId(url) {
    if (!url) return null;
    var m = String(url).match(/\\/d\\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    try { return new URL(url).searchParams.get('id'); } catch (e) { return null; }
  }
  function getUploadedVideoUrl(d) {
    var v = d && d.video_url ? String(d.video_url).trim() : '';
    return v || '';
  }
  function getVideoPlaybackInfo(d) {
    var uploaded = getUploadedVideoUrl(d);
    if (uploaded) return { kind: 'upload', url: uploaded };
    var fid = getDriveFileId(d && d.gdrive_url);
    if (fid) return { kind: 'drive', url: 'https://drive.google.com/file/d/' + fid + '/preview' };
    return null;
  }
  function hasVideo(d) { return Boolean(getVideoPlaybackInfo(d)); }
  function getThumbnailUrl(d) {
    var custom = d && d.thumbnail_url ? String(d.thumbnail_url).trim() : '';
    if (custom) return custom;
    var fid = getDriveFileId(d && d.gdrive_url);
    return fid ? ('https://drive.google.com/thumbnail?id=' + fid + '&sz=w640') : '';
  }
  function getDownloadUrl(d) {
    var uploaded = getUploadedVideoUrl(d);
    if (uploaded) return uploaded;
    var fid = getDriveFileId(d && d.gdrive_url);
    return fid ? ('https://drive.google.com/uc?export=download&id=' + fid) : '';
  }

  function filtered() {
    return DRILLS.filter(function(d) {
      if (state.age !== 'All' && (d.age_groups || []).indexOf(state.age) < 0) return false;
      if (state.cat !== 'All' && d.skill_category !== state.cat) return false;
      if (state.diff !== 'All' && d.difficulty !== state.diff) return false;
      if (state.q) {
        var text = [d.coaching_cue, d.sub_skill, d.canonical_term, d.skill_category]
          .concat(d.tags || [])
          .join(' ')
          .toLowerCase();
        if (text.indexOf(state.q.toLowerCase()) < 0) return false;
      }
      return true;
    });
  }

  function render() {
    var drills = filtered();
    var stats = document.getElementById('brc-stats');
    var grid = document.getElementById('brc-grid');
    stats.textContent = drills.length + ' of ' + DRILLS.length + ' drills';

    if (drills.length === 0) {
      grid.innerHTML = '<div class="brc-empty"><h2>No drills match your filters</h2><p>Try broadening your search or resetting filters.</p></div>';
      return;
    }

    grid.innerHTML = drills.map(function(d) {
      var diffClass = 'brc-badge-' + (d.difficulty || 'intermediate');
      var ageBadges = (d.age_groups || []).map(function(a) {
        return '<span class="brc-badge brc-badge-age">' + escHtml(a) + '</span>';
      }).join('');
      var video = hasVideo(d);
      var thumb = getThumbnailUrl(d);
      var download = getDownloadUrl(d);
      var igUrl = d.url ? escHtml(d.url) : '';
      var thumbMarkup = thumb
        ? '<img class="brc-thumb-img" src="' + escHtml(thumb) + '" loading="lazy" alt=""' +
            ' onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'">' +
            '<div class="brc-thumb-placeholder" style="display:none">&#127945;</div>'
        : '<div class="brc-thumb-placeholder">&#127945;</div>';
      var thumbOverlay = video ? '<div class="brc-thumb-play">&#9654;</div>' : '';

      return '<div class="brc-card" data-id="' + escHtml(d.id) + '">' +
        '<div class="brc-thumb"' + (video ? ' onclick="BRC.open(\\'' + escHtml(d.id) + '\\')"' : '') + '>' +
          thumbMarkup + thumbOverlay +
        '</div>' +
        '<div class="brc-body">' +
          '<div class="brc-category">' + escHtml(d.skill_category || '') + '</div>' +
          '<div class="brc-title">' + escHtml(d.sub_skill || d.canonical_term || d.id) + '</div>' +
          '<div class="brc-cue">' + escHtml(d.coaching_cue || '') + '</div>' +
          '<div class="brc-badges">' +
            ageBadges +
            '<span class="brc-badge ' + diffClass + '">' + escHtml(d.difficulty || '') + '</span>' +
            (video ? '<span class="brc-badge brc-badge-video">&#9654; Video</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="brc-actions">' +
          (video
            ? '<button class="brc-action" onclick="BRC.open(\\'' + escHtml(d.id) + '\\')">&#9654; Watch</button>'
            : '<button class="brc-action" disabled>&#9654; Watch</button>') +
          (igUrl ? '<a class="brc-action secondary" href="' + igUrl + '" target="_blank" rel="noopener">Instagram &#8599;</a>' : '') +
          (download ? '<a class="brc-action secondary" href="' + escHtml(download) + '" target="_blank" rel="noopener" download>&#11015; Download</a>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function openModal(id) {
    var d = DRILLS.find(function(x) { return x.id === id; });
    if (!d) return;
    var playback = getVideoPlaybackInfo(d);
    if (!playback) return;
    var thumb = getThumbnailUrl(d);
    var title = escHtml(d.sub_skill || d.canonical_term || d.id);
    var cue = escHtml(d.coaching_cue || '');
    var media = playback.kind === 'upload'
      ? '<video class="brc-modal-player" controls preload="metadata"' +
          (thumb ? ' poster="' + escHtml(thumb) + '"' : '') +
          ' src="' + escHtml(playback.url) + '"></video>'
      : '<iframe class="brc-modal-iframe" src="' + playback.url + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    var bd = document.createElement('div');
    bd.className = 'brc-modal-backdrop';
    bd.id = 'brc-modal';
    bd.innerHTML =
      '<button class="brc-modal-close" onclick="BRC.close()" title="Close">&times;</button>' +
      '<div class="brc-modal-inner">' +
        media +
        '<div class="brc-modal-info"><h2>' + title + '</h2>' + (cue ? '<p>' + cue + '</p>' : '') + '</div>' +
      '</div>';
    bd.addEventListener('click', function(e) { if (e.target === bd) closeModal(); });
    document.body.appendChild(bd);
    document.addEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() {
    var el = document.getElementById('brc-modal');
    if (el) el.remove();
    document.removeEventListener('keydown', onEsc);
  }

  function populateFilters() {
    var catSel = document.getElementById('brc-cat');
    catSel.innerHTML = '<option value="All">All Categories</option>' +
      CATEGORIES.map(function(c) { return '<option value="' + escHtml(c) + '">' + escHtml(c) + '</option>'; }).join('');

    var ageBar = document.getElementById('brc-age-tabs');
    ageBar.innerHTML = ['All'].concat(AGE_GROUPS).map(function(a) {
      return '<button class="brc-age-tab' + (a === 'All' ? ' active' : '') + '" data-age="' + escHtml(a) + '">' + escHtml(a) + '</button>';
    }).join('');
    ageBar.addEventListener('click', function(e) {
      var t = e.target;
      if (!t.matches('.brc-age-tab')) return;
      state.age = t.dataset.age;
      ageBar.querySelectorAll('.brc-age-tab').forEach(function(b) { b.classList.toggle('active', b === t); });
      render();
    });
  }

  function bind() {
    document.getElementById('brc-cat').addEventListener('change', function(e) { state.cat = e.target.value; render(); });
    document.getElementById('brc-diff').addEventListener('change', function(e) { state.diff = e.target.value; render(); });
    document.getElementById('brc-search').addEventListener('input', function(e) { state.q = e.target.value; render(); });
  }

  window.BRC = { open: openModal, close: closeModal };

  document.addEventListener('DOMContentLoaded', function() {
    populateFilters();
    bind();
    render();
  });
})();
`;

function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderGalleryHtml({ drills, generatedAt }) {
  const categories = [...new Set(drills.map(d => d.skill_category).filter(Boolean))].sort();
  const ageGroups = [...new Set(drills.flatMap(d => d.age_groups || []))].sort();

  const generatedLabel = new Date(generatedAt || Date.now()).toISOString().slice(0, 10);

  const dataJson = JSON.stringify(drills);
  const catsJson = JSON.stringify(categories);
  const agesJson = JSON.stringify(ageGroups);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Blackthorn Rugby Club — Drill Library</title>
<style>${GALLERY_CSS}</style>
</head>
<body>
<div class="brc-gallery">
  <div class="brc-header">
    <h1>&#127945; Drill Library</h1>
    <div class="meta">${escAttr(drills.length)} drills &middot; updated ${escAttr(generatedLabel)}</div>
  </div>
  <div class="brc-age-tabs" id="brc-age-tabs"></div>
  <div class="brc-filters">
    <div class="fg fg-search">
      <label for="brc-search">Search</label>
      <input id="brc-search" type="search" placeholder="Coaching cue, skill, tag..." autocomplete="off">
    </div>
    <div class="fg">
      <label for="brc-cat">Category</label>
      <select id="brc-cat"></select>
    </div>
    <div class="fg">
      <label for="brc-diff">Difficulty</label>
      <select id="brc-diff">
        <option value="All">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>
  </div>
  <div class="brc-stats" id="brc-stats"></div>
  <div class="brc-grid" id="brc-grid"></div>
</div>
<script>
window.__BRC_DRILLS__ = ${dataJson};
window.__BRC_CATEGORIES__ = ${catsJson};
window.__BRC_AGE_GROUPS__ = ${agesJson};
</script>
<script>${GALLERY_JS}</script>
</body>
</html>`;
}
