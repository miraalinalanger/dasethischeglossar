// ---------------------------------------------
// 🔗 HIER DEINE LINKS EINFÜGEN:
// ---------------------------------------------

// 1️⃣ Google Sheet ID (NICHT die ganze URL!)
//    Beispiel: https://docs.google.com/spreadsheets/d/ABCDEFGHI123456789/edit#gid=0
//    → Sheet-ID ist nur der Teil zwischen /d/ und /edit
const SHEET_ID = "GnTOBdhec3TdVM";

// 2️⃣ Google Formular-Link (komplette URL)
//    Beispiel: https://docs.google.com/forms/d/e/1FAIpQLSf1234xyz/viewform
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScVRmUn8n-DEezYiPPiTqxhFRJI9Du8IwaSPjaoNNStFsEi3g/viewform?usp=header";

// ---------------------------------------------
// 🚀 AB HIER MUSST DU NICHTS MEHR ÄNDERN
// ---------------------------------------------

document.getElementById("jahr").textContent = new Date().getFullYear();
document.getElementById("addBtn").addEventListener("click", () => {
  window.open(FORM_URL, "_blank");
});

const searchInput = document.getElementById("search");
const listEl = document.getElementById("glossar");

async function loadSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(url);
    const txt = await res.text();

    // Google liefert JSON in einer JS-Funktion verpackt -> hier herauslösen:
    const jsonStr = txt.substring(txt.indexOf("{"), txt.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);

    const cols = data.table.cols.map(c => c.label);
    const rows = data.table.rows.map(r => {
      const obj = {};
      r.c.forEach((cell, i) => {
        obj[cols[i]] = cell ? cell.v : "";
      });
      return obj;
    });

    return rows;
  } catch (err) {
    console.error("Fehler beim Laden des Sheets", err);
    listEl.innerHTML = "<p>⚠️ Daten konnten nicht geladen werden. Überprüfe die Sheet-ID und ob das Dokument veröffentlicht wurde.</p>";
    return [];
  }
}

function renderList(items) {
  if (!items.length) {
    listEl.innerHTML = "<p>Keine Einträge gefunden.</p>";
    return;
  }

  const query = (searchInput.value || "").toLowerCase();
  const filtered = items.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(query)
  );

  listEl.innerHTML = filtered
    .map(i => {
      const tags = (i.Tags || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      return `
        <article class="card">
          <h3>${escapeHtml(i.Begriff || "")}</h3>
          <div class="meta">${escapeHtml(i.Perspektive || "")} — ${escapeHtml(i.Autor || "")}</div>
          <p>${escapeHtml(i.Definition || "")}</p>
          ${
            tags.length
              ? `<div class="tags">${tags
                  .map(t => `<span class="tag">#${escapeHtml(t)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Start
let currentItems = [];
loadSheet().then(items => {
  currentItems = items;
  renderList(items);
});

searchInput.addEventListener("input", () => renderList(currentItems));
