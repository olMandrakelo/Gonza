const MODEL = "claude-opus-5";
const API_URL = "https://api.anthropic.com/v1/messages";
const MENU_ID = "promptcraft-analyze";
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT = `You are an expert prompt engineer for AI image generators (Midjourney, Stable Diffusion, DALL-E).
Given an image, write ONE detailed English prompt that would recreate it: subject, composition, style/medium, lighting, color palette, mood, camera/lens details if relevant.
Respond with the prompt only, no preamble, no quotes, no markdown.`;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Generar prompt con PromptCraft",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === MENU_ID && info.srcUrl) {
    handleImage(info.srcUrl);
  }
});

async function handleImage(imageUrl) {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    notify("Falta la API key", "Configurala en las opciones de la extensión.");
    chrome.runtime.openOptionsPage();
    return;
  }

  notify("Analizando imagen...", "Esto puede tardar unos segundos.");

  try {
    const prompt = await analyzeImage(imageUrl, apiKey);
    await saveResult(imageUrl, prompt);
    notify("Prompt listo", "Abrí el ícono de la extensión para verlo y copiarlo.");
  } catch (err) {
    notify("Error al analizar la imagen", err.message);
  }
}

async function analyzeImage(imageUrl, apiKey) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            { type: "text", text: "Generate the prompt for this image." },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }
  if (data.stop_reason === "refusal") {
    throw new Error("Claude no pudo analizar esta imagen (refusal).");
  }

  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("La respuesta no contiene texto.");
  }
  return textBlock.text.trim();
}

async function saveResult(imageUrl, prompt) {
  const { history = [] } = await chrome.storage.local.get("history");
  const entry = { imageUrl, prompt, timestamp: Date.now() };
  const updated = [entry, ...history].slice(0, HISTORY_LIMIT);
  await chrome.storage.local.set({ history: updated });
}

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title,
    message,
  });
}
