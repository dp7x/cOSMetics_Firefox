// popup.js
const t = (key, substitutions) => browser.i18n.getMessage(key, substitutions) || key;
const uiLanguage = browser.i18n.getUILanguage().split(/[-_]/)[0].toLowerCase();
document.documentElement.lang = ['it', 'en', 'sk', 'de', 'fr', 'es'].includes(uiLanguage) ? uiLanguage : 'en';
document.title = t('appName');
document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
// Only bundled translation strings are inserted as markup; never use this for layer names/URLs.
function translatedMarkup(message) {
    const parsed = new DOMParser().parseFromString(message, 'text/html');
    const fragment = document.createDocumentFragment();
    function appendSafe(parent, node) {
        if (node.nodeType === Node.TEXT_NODE) { parent.appendChild(document.createTextNode(node.textContent)); return; }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (!['STRONG', 'B', 'EM', 'BR', 'A'].includes(node.tagName)) {
            parent.appendChild(document.createTextNode(node.textContent)); return;
        }
        const element = document.createElement(node.tagName.toLowerCase());
        if (node.tagName === 'A') {
            try {
                const url = new URL(node.getAttribute('href'));
                if (url.protocol === 'https:' && url.hostname === 'www.openstreetmap.org') {
                    element.href = url.href;
                    element.target = '_blank';
                    element.rel = 'noopener noreferrer';
                }
            } catch { /* A malformed link is displayed as plain text. */ }
        }
        node.childNodes.forEach(child => appendSafe(element, child));
        parent.appendChild(element);
    }
    parsed.body.childNodes.forEach(node => appendSafe(fragment, node));
    return fragment;
}
document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.replaceChildren(translatedMarkup(t(el.dataset.i18nHtml)));
});

document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('saveButton').addEventListener('click', saveSettings);

const overtureEnabled = document.getElementById('overtureEnabled');
browser.storage.sync.get('overtureEnabled').then(items => {
    overtureEnabled.checked = items.overtureEnabled === true;
});
overtureEnabled.addEventListener('change', () => {
    browser.storage.sync.set({ overtureEnabled: overtureEnabled.checked });
});

const commentsInEnglish = document.getElementById('commentsInEnglish');
browser.storage.sync.get('commentsInEnglish').then(items => {
    commentsInEnglish.checked = items.commentsInEnglish === true;
});
commentsInEnglish.addEventListener('change', () => {
    browser.storage.sync.set({ commentsInEnglish: commentsInEnglish.checked });
});

function normalizeCommentHashtag(value) {
    if (typeof value !== 'string') return '';
    const text = value.trim().replace(/^#+/, '');
    if (!text) return '';
    if (!/^[\p{L}\p{M}\p{N}_-]+$/u.test(text) || text.length > 99) return null;
    return `#${text}`;
}

// Local preference: retained across popup closures and browser restarts until cleared.
const changesetHashtag = document.getElementById('changesetHashtag');
const clearHashtag = document.getElementById('clearHashtag');
const hashtagFeedback = document.getElementById('hashtagFeedback');
let hashtagTouched = false;
let hashtagSaveRequest = 0;
browser.storage.local.get('changesetHashtag').then(items => {
    if (hashtagTouched) return;
    changesetHashtag.value = normalizeCommentHashtag(items.changesetHashtag) || '';
    clearHashtag.disabled = !changesetHashtag.value;
});
function saveCommentHashtag() {
    hashtagTouched = true;
    const request = ++hashtagSaveRequest;
    const value = normalizeCommentHashtag(changesetHashtag.value);
    clearHashtag.disabled = !changesetHashtag.value;
    if (value === null) {
        hashtagFeedback.textContent = t('hashtagInvalid');
        changesetHashtag.setAttribute('aria-invalid', 'true');
        return;
    }
    changesetHashtag.removeAttribute('aria-invalid');
    browser.storage.local.set({ changesetHashtag: value }).then(() => {
        if (request !== hashtagSaveRequest) return;
        hashtagFeedback.textContent = t(value ? 'hashtagSaved' : 'hashtagCleared');
        clearHashtag.disabled = !value;
    }).catch(() => {
        if (request === hashtagSaveRequest) hashtagFeedback.textContent = t('hashtagSaveError');
    });
}
changesetHashtag.addEventListener('input', saveCommentHashtag);
changesetHashtag.addEventListener('blur', () => {
    const value = normalizeCommentHashtag(changesetHashtag.value);
    if (value !== null) changesetHashtag.value = value;
});
clearHashtag.addEventListener('click', () => {
    changesetHashtag.value = '';
    saveCommentHashtag();
    changesetHashtag.focus();
});

const settingsForm = document.getElementById('settingsForm');
const feedbackDiv = document.getElementById('feedback');

// To add buttons for new layers
const addLayerButton = document.createElement('button');
addLayerButton.textContent = t('addLayer');
addLayerButton.type = 'button'; 
addLayerButton.style.cssText = `
    display: block;
    width: 100%;
    padding: 8px 10px;
    background-color: #6c757d; 
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 10px;
    margin-bottom: 15px;
`;
addLayerButton.onmouseover = () => addLayerButton.style.backgroundColor = '#5a6268';
addLayerButton.onmouseout = () => addLayerButton.style.backgroundColor = '#6c757d';
settingsForm.parentNode.insertBefore(addLayerButton, settingsForm.nextSibling);  

addLayerButton.addEventListener('click', () => {
    addLayerInputGroup({ text: '', url: '' }); // new empty group
});


function addLayerInputGroup(layer = { text: '', url: '' }) {
    const layerCount = settingsForm.children.length; // Checks existing layers
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');
    inputGroup.dataset.index = layerCount; // Assigns an index

    function addField(id, labelKey, placeholderKey, value, second = false) {
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = t(labelKey);
        if (second) label.style.marginTop = '10px';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.placeholder = t(placeholderKey);
        input.required = true;
        input.value = value;
        inputGroup.append(label, input);
    }
    addField(`layerName${layerCount}`, 'buttonText', 'layerNameExample', layer.text);
    addField(`layerUrl${layerCount}`, 'urlTemplate', 'urlExample', layer.url, true);
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-layer-button';
    removeButton.textContent = t('removeLayer');
    removeButton.style.cssText = 'background-color:#dc3545;margin-top:10px;padding:5px 10px;font-size:12px;width:auto;display:inline-block';
    inputGroup.appendChild(removeButton);

    removeButton.addEventListener('click', () => {
        inputGroup.remove();
        Array.from(settingsForm.children).forEach((group, index) => {
            group.dataset.index = index;
            group.querySelector('label[for^="layerName"]').htmlFor = `layerName${index}`;
            group.querySelector('input[id^="layerName"]').id = `layerName${index}`;
            group.querySelector('label[for^="layerUrl"]').htmlFor = `layerUrl${index}`;
            group.querySelector('input[id^="layerUrl"]').id = `layerUrl${index}`;
        });
    });

    settingsForm.appendChild(inputGroup);
}

async function loadSettings() {
    const items = await browser.storage.sync.get('customLayerSettings');
    if (items.customLayerSettings && items.customLayerSettings.length > 0) {
        items.customLayerSettings.forEach(layer => addLayerInputGroup(layer));
    } else {
        // Adds an empty input group by default if there are no saved settings
        addLayerInputGroup({ text: 'OSM Standard', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
    }
}

function saveSettings() {
    const customLayerSettings = [];
    const inputGroups = settingsForm.querySelectorAll('.input-group');

    inputGroups.forEach(group => {
        const textInput = group.querySelector('input[id^="layerName"]');
        const urlInput = group.querySelector('input[id^="layerUrl"]');

        if (textInput.value.trim() && urlInput.value.trim()) {
            customLayerSettings.push({
                text: textInput.value.trim(),
                url: urlInput.value.trim()
            });
        }
    });

    browser.storage.sync.set({ customLayerSettings }).then(() => {
        feedbackDiv.textContent = t('settingsSaved');
        setTimeout(() => feedbackDiv.textContent = '', 3000);
    });
}
