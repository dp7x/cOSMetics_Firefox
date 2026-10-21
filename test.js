// test.js - FILE SEPARATO
console.log("🔴🔴🔴 TEST: Content script Eseguito!");
console.log("📍 URL:", window.location.href);

// Aggiungi un banner visibile
const banner = document.createElement('div');
banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    background: #ff0000;
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 24px;
    font-weight: bold;
`;
banner.textContent = '🧪 COSMETICS EXTENSION LOADED!';
document.body.appendChild(banner);

// Aggiungi un pulsante
const btn = document.createElement('button');
btn.textContent = '✅ CLICK ME - Extension Works!';
btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: #00aa00;
    color: white;
    padding: 20px 30px;
    border: none;
    border-radius: 10px;
    font-size: 20px;
    cursor: pointer;
`;
btn.onclick = () => alert('✅ Extension is working!');
document.body.appendChild(btn);