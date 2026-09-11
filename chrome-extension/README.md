# PromptCraft - Imagen a Prompt

Extensión de Chrome (Manifest V3) para uso personal: click derecho sobre
cualquier imagen de una página y genera un prompt detallado en inglés, listo
para usar en Midjourney, Stable Diffusion, DALL-E, etc. Llama directo a la
API de Claude (Anthropic) con tu propia API key.

## Instalación

1. Abrí `chrome://extensions`
2. Activá "Modo desarrollador" (arriba a la derecha)
3. Click en "Cargar descomprimida" y seleccioná esta carpeta (`chrome-extension/`)
4. Click derecho en el ícono de la extensión (o abrí el popup y tocá el link
   de configuración) para cargar tu API key de Anthropic (`console.anthropic.com`)

## Uso

1. Click derecho sobre cualquier imagen de una web
2. Elegí "Generar prompt con PromptCraft"
3. Esperá la notificación "Prompt listo"
4. Abrí el ícono de la extensión: ahí aparece el historial con cada prompt y
   un botón para copiarlo

## Cómo funciona

- `manifest.json`: declara el menú contextual, permisos y la página de opciones
- `background.js`: service worker que crea el menú, llama a la API de Claude
  (`claude-opus-5`, vision por URL) y guarda el resultado en `chrome.storage.local`
- `popup.html`/`popup.js`: muestra el historial de prompts generados
- `options.html`/`options.js`: guarda la API key

La API key se guarda solo en tu navegador y nunca sale de la extensión salvo
hacia `api.anthropic.com`.
