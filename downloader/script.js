document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    function addMessage(htmlContent, sender, asHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        if (asHTML) {
            messageDiv.innerHTML = htmlContent;
        } else {
            messageDiv.innerHTML = `<p>${htmlContent}</p>`;
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    function showLoading(text) {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message', 'loading-indicator');
        loadingDiv.innerHTML = `<p>${text}</p>`;
        loadingDiv.id = 'loading-msg';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoading() {
        const loadMsg = document.getElementById('loading-msg');
        if (loadMsg) loadMsg.remove();
    }

    async function descargarComoBlob(url, fileName, btnEl) {
        try {
            btnEl.textContent = 'Descargando...';
            btnEl.style.pointerEvents = 'none';

            const res = await fetch(url, { referrerPolicy: 'no-referrer' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);

            btnEl.textContent = 'Descargado';
        } catch (err) {
            console.error(err);
            btnEl.textContent = 'Abriendo en nueva pestaña...';
            btnEl.style.pointerEvents = 'auto';
            window.open(url, '_blank');
        }
    }

    function crearBotonDescarga(downloadUrl, fileName) {
        const btn = document.createElement('a');
        btn.className = 'download-link';
        btn.textContent = 'Descargar';
        btn.href = '#';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            descargarComoBlob(downloadUrl, fileName, btn);
        });
        return btn;
    }

    function detectarPlataforma(url) {
        if (url.includes('pin.it')) return 'Pinterest';
        if (url.includes('facebook.com')) return 'Facebook';
        if (url.includes('threads.net')) return 'Threads';
        if (url.includes('tiktok.com')) return 'TikTok';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
        if (url.includes('instagram.com')) return 'Instagram';
        return null;
    }

    function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        const plataforma = detectarPlataforma(text);

        if (!plataforma) {
            addMessage('Plataforma no soportada. Probá con YouTube, TikTok, Instagram o Twitter.', 'bot');
            return;
        }

        if (plataforma === 'YouTube') {
            mostrarSelectorYouTube(text);
        } else {
            procesarDescarga(plataforma, text);
        }
    }

    function mostrarSelectorYouTube(url) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        messageDiv.innerHTML = `
            <div class="yt-chooser">
                <span>¿Qué querés descargar?</span>
                <div class="yt-buttons">
                    <button class="yt-btn audio" data-url="${url}" data-type="audio">Audio</button>
                    <button class="yt-btn video" data-url="${url}" data-type="video">Video</button>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        messageDiv.querySelectorAll('.yt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const targetUrl = btn.dataset.url;
                
                messageDiv.querySelectorAll('.yt-btn').forEach(b => b.disabled = true);
                btn.textContent = btn.textContent + ' ✓';
                if (type === 'audio') {
                    procesarDescarga('YouTubeAudio', targetUrl);
                } else {
                    procesarDescarga('YouTubeVideo', targetUrl);
                }
            });
        });
    }

    async function procesarDescarga(plataforma, urlVideo) {
        showLoading(`Procesando enlace de ${plataforma}...`);

        let apiUrl = '';
        switch (plataforma) {
            case 'Pinterest':
                apiUrl = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'Facebook':
                apiUrl = `https://api.delirius.store/download/facebook?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'Threads':
                 apiUrl = `https://api.delirius.store/download/threads?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'TikTok':
                apiUrl = `https://api.delirius.store/download/tiktok?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'Twitter':
                apiUrl = `https://api.delirius.store/download/twitterdl?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'Instagram':
                apiUrl = `https://api.delirius.store/download/instagram?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'YouTubeAudio':
                apiUrl = `https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(urlVideo)}`;
                break;
            case 'YouTubeVideo':
                apiUrl = `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(urlVideo)}&format=360`;
                break;
            default:
                removeLoading();
                addMessage('Plataforma no soportada.', 'bot');
                return;
        }

        try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            removeLoading();

            let downloadUrl = null;
            let title = 'Contenido';
            let thumbnail = null;
            let badge = plataforma;
            let extension = 'mp4';

            if (plataforma === 'TikTok') {
                if (!json.status) { addMessage('Error al procesar el link de TikTok.', 'bot'); return; }
                title = json.data?.title || title;
                // Try video first, then audio fallback
                const media = json.data?.meta?.media?.[0];
                if (media?.type === 'image') {
                    // It's a slideshow; provide audio
                    downloadUrl = media?.audio;
                    extension = 'mp3';
                } else {
                    downloadUrl = media?.org || media?.hd;
                }
                badge = 'TikTok';
            }

            else if (plataforma === 'Twitter') {
                if (!json.found) { addMessage('No se encontró video en ese tweet.', 'bot'); return; }
                downloadUrl = json.media?.[0]?.url;
                title = json.info?.user_name ? `@${json.info.user_screen_name}` : 'Twitter Video';
                thumbnail = json.info?.user_profile_image_url || null;
                badge = 'Twitter / X';
            }

            else if (plataforma === 'Instagram') {
                if (!json.status || !json.data?.length) { addMessage('No se pudo obtener el contenido de Instagram.', 'bot'); return; }
                json.data.forEach((item, i) => {
                    const ext = item.type === 'video' ? 'mp4' : 'jpg';
                    const fileName = `instagram_${i + 1}.${ext}`;

                    const card = document.createElement('div');
                    card.className = 'video-download-card';
                    card.innerHTML = `<div class="card-info"><div class="card-badge">Instagram · ${item.type === 'video' ? 'Video' : 'Imagen'} ${i + 1}</div></div>`;
                    card.querySelector('.card-info').appendChild(crearBotonDescarga(item.url, fileName));

                    const msgDiv = document.createElement('div');
                    msgDiv.classList.add('message', 'bot-message');
                    msgDiv.appendChild(card);
                    chatMessages.appendChild(msgDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
                return;
            }

        else if (plataforma === 'Pinterest') {
            if (!json.status) { addMessage('Error al procesar el link de Pinterest.', 'bot'); return; }
                downloadUrl = json.data?.download?.url;
                title = json.data?.title || title;
                thumbnail = json.data?.thumbnail || null;
                extension = json.data?.download?.type === 'video' ? 'mp4' : 'jpg';
                badge = 'Pinterest';
            }

        else if (plataforma === 'Facebook') {
            if (!json.urls?.length) { addMessage('Error al procesar el link de Facebook.', 'bot'); return; }
                downloadUrl = json.urls[0]?.hd || json.urls[1]?.sd;
                title = json.title || title;
                extension = 'mp4';
                badge = json.isHdAvailable ? 'Facebook · HD' : 'Facebook · SD';
            }

        else if (plataforma === 'Threads') {
            if (!json.status || !json.data?.length) { addMessage('Error al procesar el link de Threads.', 'bot'); return; }
                json.data.forEach((item, i) => {
                    const ext = item.type === 'video' ? 'mp4' : 'jpg';
                    const fileName = `threads_${i + 1}.${ext}`;
                    const card = document.createElement('div');
                    card.className = 'video-download-card';
                    const info = document.createElement('div');
                    info.className = 'card-info';
                    info.innerHTML = `<div class="card-badge">Threads · ${item.type === 'video' ? 'Video' : 'Imagen'} ${i + 1}</div>`;
                    info.appendChild(crearBotonDescarga(item.url, fileName));
                    card.appendChild(info);
                    const msgDiv = document.createElement('div');
                    msgDiv.classList.add('message', 'bot-message');
                    msgDiv.appendChild(card);
                    chatMessages.appendChild(msgDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
                return;
            }
            
            // --- YouTube Audio ---
            else if (plataforma === 'YouTubeAudio') {
                if (!json.success) { addMessage('Error al procesar el audio de YouTube.', 'bot'); return; }
                downloadUrl = json.data?.download;
                title = json.data?.title || title;
                extension = 'mp3';
                badge = 'YouTube · MP3';
            }

            // --- YouTube Video ---
            else if (plataforma === 'YouTubeVideo') {
                if (!json.status) { addMessage('Error al procesar el video de YouTube.', 'bot'); return; }
                downloadUrl = json.data?.download;
                title = json.data?.title || title;
                thumbnail = json.data?.image || null;
                extension = 'mp4';
                badge = `YouTube · ${json.data?.format || '360'}p`;
            }

            const safeFileName = title.replace(/[^a-z0-9]/gi, '_').substring(0, 40) + '.' + extension;

            if (!downloadUrl) {
                addMessage('No se pudo obtener el link de descarga.', 'bot');
                return;
            }

            const card = document.createElement('div');
            card.className = 'video-download-card';

            if (thumbnail) {
                const img = document.createElement('img');
                img.src = thumbnail;
                img.alt = 'thumbnail';
                img.onerror = () => img.style.display = 'none';
                card.appendChild(img);
            }

            const info = document.createElement('div');
            info.className = 'card-info';
            info.innerHTML = `<div class="card-badge">${badge}</div><div class="card-title">${title}</div>`;
            info.appendChild(crearBotonDescarga(downloadUrl, safeFileName));
            card.appendChild(info);

            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', 'bot-message');
            msgDiv.appendChild(card);
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            removeLoading();
            console.error(error);
            addMessage('Hubo un error al conectarse. Revisá el link e intentá de nuevo.', 'bot');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});