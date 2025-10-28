const langBtn = document.getElementById("langBtn");
const flag = document.getElementById("flag");

let currentLang = "es";

const texts = {
  es: {
    title: "🌙 MoonBot",
    subtitle: "Tu asistente inteligente para WhatsApp",
    description: "Bienvenido a MoonBot, el bot multifuncional creado para ayudarte a administrar grupos, automatizar tareas y mantener el entretenimiento en tus chats.",
    aboutTitle: "¿Qué puede hacer MoonBot?",
    aboutText: "MoonBot combina herramientas de administración, diversión y automatización para que tu experiencia en WhatsApp sea más completa. Desde proteger tus grupos hasta descargar videos o música, lo hace todo.",
    featuresTitle: "🔧 Funciones principales",
    featuresList: [
      "✦ Seguridad: Anti-Link y Only-Admin.",
      "✦ Descargadores: YouTube, Instagram, TikTok y más.",
      "✦ Diversión: Comandos de entretenimiento, ruleta rusa y más.",
      "✦ Gestión: Baneo de miembros, ascender miembros o degradarlos y mucho más para tu grupo!"
    ],
    ctaTitle: "¡Empieza a usar MoonBot hoy!",
    ctaText: "Haz clic en uno de los botones para contactar al bot o unirte al canal oficial.",
    btnBot: "Número del Bot",
    btnChannel: "Canal Oficial",
    footerText: "© 2024 MoonBot — Creado por"
  },
  en: {
    title: "🌙 MoonBot",
    subtitle: "Your smart WhatsApp assistant",
    description: "Welcome to MoonBot, the multifunctional bot designed to help you manage groups, automate tasks, and keep your chats fun and organized.",
    aboutTitle: "What can MoonBot do?",
    aboutText: "MoonBot combines admin tools, fun features, and automation to make your WhatsApp experience complete. From protecting groups to downloading media — it does it all.",
    featuresTitle: "🔧 Main Features",
    featuresList: [
      "✦ Security: Anti-Link and Admin-Only.",
      "✦ Downloaders: YouTube, Instagram, TikTok, and more.",
      "✦ Fun: Entertainment commands, Russian roulette, and more.",
      "✦ Management: Ban members, promote or demote members, and much more for your group!"
    ],
    ctaTitle: "Start using MoonBot today!",
    ctaText: "Click one of the buttons to contact the bot or join the official channel.",
    btnBot: "Bot Number",
    btnChannel: "Official Channel",
    footerText: "© 2024 MoonBot — Created by"
  }
};

langBtn.addEventListener("click", () => {
  currentLang = currentLang === "es" ? "en" : "es";
  const t = texts[currentLang];

  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("description").textContent = t.description;
  document.getElementById("about-title").textContent = t.aboutTitle;
  document.getElementById("about-text").textContent = t.aboutText;
  document.getElementById("features-title").textContent = t.featuresTitle;

  const featuresList = document.getElementById("features-list");
  featuresList.innerHTML = "";
  t.featuresList.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    featuresList.appendChild(li);
  });

  document.getElementById("cta-title").textContent = t.ctaTitle;
  document.getElementById("cta-text").textContent = t.ctaText;
  document.getElementById("btn-bot").textContent = t.btnBot;
  document.getElementById("btn-channel").textContent = t.btnChannel;
  document.getElementById("footer-text").textContent = t.footerText;

  flag.src =
    currentLang === "es"
      ? "https://flagcdn.com/gb.svg"
      : "https://flagcdn.com/es.svg";
});
