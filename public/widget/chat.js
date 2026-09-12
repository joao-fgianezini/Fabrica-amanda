(function() {
  var params = new URLSearchParams(document.currentScript.src.split('?')[1] || '');
  var dealerId = params.get('dealer') || '';

  if (!dealerId) { console.error('Chat: dealer ID não fornecido'); return; }

  // Determine the base URL for the widget
  var scriptSrc = document.currentScript.src;
  var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget/') + 8);
  var chatUrl = baseUrl + 'chat.html?dealer=' + dealerId;

  // Create the floating button
  var btn = document.createElement('div');
  btn.style.cssText = [
    'position: fixed', 'bottom: 20px', 'right: 20px', 'z-index: 999999',
    'width: 60px', 'height: 60px', 'border-radius: 50%',
    'background: linear-gradient(135deg, #2a93e8, #2076c9)',
    'box-shadow: 0 4px 20px rgba(42,147,232,0.4)',
    'cursor: pointer', 'display: flex', 'align-items: 'center',
    'justify-content: center', 'transition: transform 0.2s ease',
    'animation: chatPulse 2s infinite'
  ].join(';') + ';';

  btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  // Create the popup iframe
  var popup = document.createElement('div');
  popup.style.cssText = [
    'position: fixed', 'bottom: 90px', 'right: 20px', 'z-index: 999998',
    'width: 360px', 'height: 520px', 'max-width: calc(100vw - 40px)',
    'max-height: calc(100vh - 120px)', 'border-radius: 16px',
    'overflow: hidden', 'box-shadow: 0 8px 40px rgba(0,0,0,0.3)',
    'display: none', 'border: 1px solid rgba(42,147,232,0.3)'
  ].join(';') + ';';

  var iframe = document.createElement('iframe');
  iframe.src = chatUrl;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.title = 'Chat de atendimento';
  popup.appendChild(iframe);

  var isOpen = false;

  btn.addEventListener('click', function() {
    isOpen = !isOpen;
    popup.style.display = isOpen ? 'block' : 'none';
    btn.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
  });

  btn.addEventListener('mouseenter', function() { btn.style.transform = 'scale(1.1)'; });
  btn.addEventListener('mouseleave', function() { btn.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'; });

  // Add pulse animation
  var style = document.createElement('style');
  style.textContent = '@keyframes chatPulse { 0%, 100% { box-shadow: 0 4px 20px rgba(42,147,232,0.4); } 50% { box-shadow: 0 4px 30px rgba(42,147,232,0.6); } }';
  document.head.appendChild(style);

  document.body.appendChild(popup);
  document.body.appendChild(btn);
})();
