document.addEventListener('DOMContentLoaded', () => {

  const moonbotButton = document.querySelector('.btn.primary');
  const githubButton = document.querySelector('.btn.secondary');
  const contactButton = document.querySelector('.btn.tertiary');

  if (moonbotButton) {
    moonbotButton.addEventListener('click', () => {
      window.location.href = '/moonbot';
    });
  }

  if (githubButton) {
    githubButton.addEventListener('click', () => {
      window.open('https://github.com/Smokyy14', '_blank');
    });
  }

  if (contactButton) {
  contactButton.addEventListener('click', () => {
    window.open('https://wa.me/59895609705', '_blank');
  });
}

});