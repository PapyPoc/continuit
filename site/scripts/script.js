src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
crossorigin="anonymous"

const navLinks = Array.from(document.querySelectorAll('.navbar .nav-link'));
const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

const activateCurrentSection = () => {
    const scrollY = window.scrollY + 140;
    let currentId = '';

    sections.forEach((section) => {
    if (section.offsetTop <= scrollY) {
        currentId = section.id;
    }
    });

    navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('active', isActive);
    });
};

window.addEventListener('scroll', activateCurrentSection);
window.addEventListener('load', activateCurrentSection);

const copyButton = document.getElementById('copyMailButton');
const copyStatus = document.getElementById('copyStatus');
const email = 'contact@continuit.fr';

copyButton.addEventListener('click', async () => {
    try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = 'Adresse copiée.';
    } catch (error) {
    copyStatus.textContent = 'Copie impossible sur ce navigateur.';
    }
});

document.getElementById('year').textContent = new Date().getFullYear();