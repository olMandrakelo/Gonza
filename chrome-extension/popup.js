const listEl = document.getElementById("list");
const warningEl = document.getElementById("warning");

document.getElementById("open-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

async function render() {
  const { apiKey, history = [] } = await chrome.storage.local.get([
    "apiKey",
    "history",
  ]);
  warningEl.hidden = Boolean(apiKey);

  if (history.length === 0) {
    listEl.innerHTML = `<div class="empty">Click derecho sobre una imagen en cualquier página y elegí "Generar prompt con PromptCraft".</div>`;
    return;
  }

  listEl.innerHTML = "";
  history.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "entry";

    const img = document.createElement("img");
    img.src = entry.imageUrl;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "entry-body";

    const promptEl = document.createElement("div");
    promptEl.className = "entry-prompt";
    promptEl.textContent = entry.prompt;

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copiar";
    copyBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(entry.prompt);
      copyBtn.textContent = "Copiado!";
      setTimeout(() => (copyBtn.textContent = "Copiar"), 1200);
    });

    body.appendChild(promptEl);
    body.appendChild(copyBtn);
    item.appendChild(img);
    item.appendChild(body);
    listEl.appendChild(item);
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.history || changes.apiKey) render();
});

render();
