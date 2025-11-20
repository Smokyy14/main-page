document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    const SYSTEM_PROMPT = `Eres Rosalina, una asistente IA creada por Smoky, PUEDES DESCARGAR VIDEOS Y AUDIOS DE PLATAFORMAS, plataformas disponibles: TikTok, Twitter, YouTube. 
TU TAREA: Analizar si el usuario quiere descargar video/audio o solo conversar.

REGLAS ABSOLUTAS DE RESPUESTA, SI NO LAS RESPETAS, EL SISTEMA SE ROMPE:
1. NO escribas ninguna introducción ni texto fuera del JSON.
2. TU RESPUESTA DEBE EMPEZAR CON "{" Y TERMINAR CON "}".
3. Si es conversación, sé amable en el campo "message".
4. No uses markdown en general, tal como backticks, ** o similares
5. Si tienes que mencionar YouTUbe como plataforma, no especifiques "youtubeaudio" o "youtubevideo", usa solo "YouTube" en el mensaje, pero en el campo "platform" usa los valores correctos.
6. NO OLVIDES LA REGLA 5, ES MUY IMPORTANTE.

ESTRUCTURA JSON OBLIGATORIA:
{
  "message": "Tu respuesta aquí",
  "platform": "TikTok" | "Twitter" | "YouTubeVideo" | "YouTubeAudio" | null,
  "url": "URL detectada" | null
}
YouTubeVideo será otorgado si el usuario PIDE descargar el video o no especifica y solo pasa el enlace.
YouTubeAudio será otorgado si el usuario PIDE descargar solo el audio o una canción como tal.
Si no hay intención de descarga, ambos campos "platform" y "url" deben ser null.`;

    function limpiarUrl(urlSucia) {
        if (!urlSucia) return null;
        const match = urlSucia.match(/\[.*?\]\((.*?)\)/);
        if (match && match[1]) {
            return match[1];
        }
        return urlSucia;
    }

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        let formattedMsg = message.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<p>${formattedMsg}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showLoading(text) {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message', 'loading-indicator');
        loadingDiv.innerHTML = `<i>${text}</i>`;
        loadingDiv.id = "loading-msg";
        chatMessages.appendChild(loadingDiv);
    }

    function removeLoading() {
        const loadMsg = document.getElementById('loading-msg');
        if(loadMsg) loadMsg.remove();
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (text === '') return;

        addMessage(text, 'user');
        userInput.value = '';
        showLoading("Rosalina está pensando...");

        try {
            const aiUrl = `https://delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(SYSTEM_PROMPT)}`;
            const aiRes = await fetch(aiUrl);
            const aiData = await aiRes.json();

            removeLoading();

            if (aiData.status && aiData.data) {
                let botJson;
                try {
                    const jsonMatch = aiData.data.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        botJson = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error("No JSON found");
                    }
                } catch (e) {
                    addMessage(aiData.data, 'bot');
                    return;
                }

                addMessage(botJson.message, 'bot');

                if (botJson.url && botJson.platform) {
                    const urlLimpia = limpiarUrl(botJson.url);
                    await procesarDescarga(botJson.platform, urlLimpia);
                }
            }

        } catch (error) {
            removeLoading();
            addMessage("Error conectando con Rosalina.", 'bot');
            console.error(error);
        }
    }

    async function procesarDescarga(plataforma, urlVideo) {
        showLoading(`Procesando enlace de ${plataforma}...`);
        let apiUrl = "";
        
        switch (plataforma) {
            case 'TikTok':
                apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${urlVideo}`;
                break;
            case 'Twitter':
                apiUrl = `https://delirius-apiofc.vercel.app/download/twitterv2?url=${urlVideo}`;
                break;
            case 'YouTubeVideo':
                apiUrl = `https://delirius-apiofc.vercel.app/download/ytmp4?url=${urlVideo}`;
                break;
            case 'YouTubeAudio':
                apiUrl = `https://delirius-apiofc.vercel.app/download/ytmp3?url=${urlVideo}`;
                break;
            default:
                removeLoading();
                addMessage("Plataforma no soportada.", 'bot');
                return;
        }

        try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            removeLoading();

            if (!json.status) {
                addMessage("❌ La API falló. Verifica que el enlace sea público y válido.", 'bot');
                return;
            }

            let finalDownloadLink = null;
            let videoTitle = "Contenido Multimedia";
            let thumbnailUrl = "https://via.placeholder.com/300x200?text=Sin+Vista+Previa";
            let mediaType = "mp4"; 
            let extension = "mp4";

            // --- LÓGICA DE EXTRACCIÓN ---

            if (plataforma === 'TikTok') {
                if (json.data && json.data.meta && json.data.meta.media.length > 0) {
                    finalDownloadLink = json.data.meta.media[0].org;
                    if(json.data.title) videoTitle = json.data.title;
                    if(json.data.cover) thumbnailUrl = json.data.cover;
                }
                mediaType = "MP4";
            } 
            else if (plataforma === 'Twitter') {
                if (json.data && json.data.media && json.data.media.length > 0) {
                    const videos = json.data.media[0].videos;
                    if(videos){
                         videos.sort((a, b) => b.bitrate - a.bitrate);
                         finalDownloadLink = videos[0].url;
                    } else {
                        finalDownloadLink = json.data.media[0].url;
                    }
                    if(json.data.description) videoTitle = json.data.description;
                    if(json.data.media[0].cover) thumbnailUrl = json.data.media[0].cover;
                }
                mediaType = "MP4";
            } 
            else if (plataforma.includes('YouTube')) {
                if (json.data && json.data.download) {
                    finalDownloadLink = json.data.download.url;
                    if (json.data.title) videoTitle = json.data.title;
                    if (json.data.image) thumbnailUrl = json.data.image;
                    extension = plataforma === 'YouTubeAudio' ? "mp3" : "mp4";
                    mediaType = extension.toUpperCase();
                }
            }

            // Creamos un nombre de archivo seguro para el atributo 'download'
            const safeFileName = videoTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 30) + "." + extension;

            if (finalDownloadLink) {
                // AQUI GENERAMOS EL HTML CON EL ATRIBUTO DOWNLOAD
                const cardHtml = `<div class="video-download-card"><p class="video-title">${videoTitle}</p><div class="thumbnail-container"><img src="${thumbnailUrl}" alt="Miniatura"><span class="media-type-overlay">${mediaType}</span></div><a href="${finalDownloadLink}" download="${safeFileName}" target="_blank" class="download-btn-card">DESCARGAR AHORA</a></div>`;
                
                addMessage(`✅ <b>¡Listo! Aquí tienes:</b>${cardHtml}`, 'bot');
            } else {
                addMessage("⚠️ La API respondió, pero no pude generar el enlace de descarga.", 'bot');
            }

        } catch (error) {
            removeLoading();
            console.error(error);
            addMessage("Error crítico al procesar la descarga.", 'bot');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});