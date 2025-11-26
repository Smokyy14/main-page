document.addEventListener('DOMContentLoaded', () => {

  const moonbotButton = document.querySelector('.btn.primary');
  const projectsButton = document.querySelector('.btn.secondary');
  const contactButton = document.querySelector('.btn.tertiary');

  if (moonbotButton) {
    moonbotButton.addEventListener('click', () => {
      window.open('./moonbot', '_blank');
    });
  }

  if (projectsButton) {
    projectsButton.addEventListener('click', () => {
      window.open('./projects', '_blank');
    });
  }

  if (contactButton) {
  contactButton.addEventListener('click', () => {
    window.open('https://wa.me/59895609705', '_blank');
  });
}

});



