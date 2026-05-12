document.addEventListener('DOMContentLoaded', () => {

  const moonbotButton = document.querySelector('.btn.primary');
  const projectsButton = document.querySelector('.btn.secondary');
  const donateButton = document.querySelector('.btn.tertiary');

  if (moonbotButton) {
    moonbotButton.addEventListener('click', () => {
      window.open('./downloader', '_blank');
    });
  }

  if (projectsButton) {
    projectsButton.addEventListener('click', () => {
      window.open('./projects', '_blank');
    });
  }

  if (donateButton) {
    donateButton.addEventListener('click', () => {
      window.open('https://ko-fi.com/smokyydev', '_blank');
    });
  }
});