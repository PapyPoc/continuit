const bootstrapScript = document.createElement('script');
bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
bootstrapScript.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
bootstrapScript.crossOrigin = 'anonymous';
document.head.appendChild(bootstrapScript);

const setText = (selector, value) => {
    if (typeof value !== 'string') return;
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
};

const setTextList = (selector, values) => {
    if (!Array.isArray(values)) return;
    const elements = document.querySelectorAll(selector);
    values.forEach((value, index) => {
        if (elements[index] && typeof value === 'string') {
            elements[index].textContent = value;
        }
    });
};

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

let currentEmail = 'contact@continuit.fr';

const applyContent = (content) => {
    if (!content || typeof content !== 'object') return;

    if (content.meta?.title) {
        document.title = content.meta.title;
    }

    setText('.navbar-brand.d-flex.align-items-left', content.brand?.subtitle);

    setText('.hero .badge-soft', content.hero?.badge);
    setText('.hero .lead-custom', content.hero?.description);

    const heroTitle = document.querySelector('.hero .hero-title');
    if (heroTitle && content.hero) {
        const before = escapeHtml(content.hero.title_before ?? '');
        const green = escapeHtml(content.hero.title_green ?? '');
        const blue = escapeHtml(content.hero.title_blue ?? '');
        const after = escapeHtml(content.hero.title_after ?? '');
        heroTitle.innerHTML = `${before} <span class="text-emerald-soft">${green}</span>, <span class="text-sky-soft">${blue}</span> ${after}`;
    }

    setText('.hero a[href="#contact"]', content.hero?.primary_button);
    setText('.hero a[href="#services"]', content.hero?.secondary_button);

    if (Array.isArray(content.hero?.tags)) {
        const tagElements = document.querySelectorAll('.hero-tags span:not(:nth-child(even))');
        content.hero.tags.forEach((value, index) => {
            if (tagElements[index]) tagElements[index].textContent = value;
        });
    }

    const miniCards = document.querySelectorAll('.hero .mini-card');
    if (miniCards[0] && content.hero?.objective) {
        const label = miniCards[0].querySelector('.mini-label');
        const value = miniCards[0].querySelector('.mini-value');
        const description = miniCards[0].querySelector('p');
        if (label) label.textContent = content.hero.objective.label ?? label.textContent;
        if (value) value.textContent = content.hero.objective.value ?? value.textContent;
        if (description) description.textContent = content.hero.objective.description ?? description.textContent;
    }

    if (miniCards[1] && content.hero?.approach) {
        const label = miniCards[1].querySelector('.mini-label');
        const value = miniCards[1].querySelector('.mini-value');
        const description = miniCards[1].querySelector('p');
        if (label) label.textContent = content.hero.approach.label ?? label.textContent;
        if (value) value.textContent = content.hero.approach.value ?? value.textContent;
        if (description) description.textContent = content.hero.approach.description ?? description.textContent;
    }

    if (miniCards[2]) {
        const title = miniCards[2].querySelector('.mini-label');
        if (title && content.hero?.needs_title) title.textContent = content.hero.needs_title;
        setTextList('.hero .need-item', content.hero?.needs);
    }

    setText('#services .section-title', content.services?.title);
    setText('#services .section-text', content.services?.description);
    if (Array.isArray(content.services?.items)) {
        const cards = document.querySelectorAll('#services .custom-card');
        content.services.items.forEach((item, index) => {
            const card = cards[index];
            if (!card || !item) return;
            const title = card.querySelector('.card-title');
            const description = card.querySelector('p');
            if (title && typeof item.title === 'string') title.textContent = item.title;
            if (description && typeof item.description === 'string') description.textContent = item.description;
        });
    }

    setText('#avantages .section-title', content.advantages?.title);
    setText('#avantages .section-text', content.advantages?.description);
    setTextList('#avantages .benefit-item', content.advantages?.items);

    setText('#methode .section-title', content.method?.title);
    if (Array.isArray(content.method?.items)) {
        const cards = document.querySelectorAll('#methode .step-card');
        content.method.items.forEach((item, index) => {
            const card = cards[index];
            if (!card || !item) return;
            const title = card.querySelector('.step-title');
            const description = card.querySelector('p');
            if (title && typeof item.title === 'string') title.textContent = item.title;
            if (description && typeof item.description === 'string') description.textContent = item.description;
        });
    }

    setText('#contact .section-title', content.contact?.title);
    setText('#contact .contact-text', content.contact?.description);
    setText('#copyMailButton', content.contact?.copy_button);

    if (typeof content.contact?.email === 'string' && content.contact.email.trim()) {
        currentEmail = content.contact.email.trim();
        const mailLink = document.querySelector('#contact .contact-mail');
        if (mailLink) {
            mailLink.textContent = currentEmail;
            mailLink.href = `mailto:${currentEmail}`;
        }
    }

    const footerContainer = document.querySelector('footer .container');
    if (footerContainer && typeof content.footer?.text === 'string') {
        footerContainer.innerHTML = `© <span id="year"></span> ${escapeHtml(content.footer.text)}`;
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
};

const loadEditableContent = async () => {
    try {
        const response = await fetch('content.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const content = await response.json();
        applyContent(content);
    } catch (error) {
        console.warn('Impossible de charger content.json, utilisation du contenu HTML par défaut.', error);
    }
};

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

if (copyButton && copyStatus) {
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(currentEmail);
            copyStatus.textContent = 'Adresse copiée.';
        } catch (error) {
            copyStatus.textContent = 'Copie impossible sur ce navigateur.';
        }
    });
}

const initialYear = document.getElementById('year');
if (initialYear) initialYear.textContent = new Date().getFullYear();

loadEditableContent();
