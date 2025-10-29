document.addEventListener('DOMContentLoaded', () => {

  const moonbotButton = document.querySelector('.btn.primary');
  const githubButton = document.querySelector('.btn.secondary');
  const contactButton = document.querySelector('.btn.tertiary');

  if (moonbotButton) {
    moonbotButton.addEventListener('click', () => {
      window.location.href = '/moonbot'; // Al subir a GitHub sacar el /
    });
  }

  if (githubButton) {
    githubButton.addEventListener('click', () => {
      window.open('https://github.com/Smokyy14/discord.js-bot', '_blank');
    });
  }

  if (contactButton) {
  contactButton.addEventListener('click', () => {
    window.open('https://ko-fi.com/smokyydev', '_blank');
  });
}

});
