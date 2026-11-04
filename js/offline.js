// Standalone animated 404. Works without external images or libraries.
  // Switch between the video's style and an Alberto Atelier dark-gold theme:
  // open 404.html?theme=alberto (or use alberto-404.html).
  (() => {
    const params = new URLSearchParams(location.search);
    const luxury = params.get('theme') !== 'original';
    const offline = true;
    if (luxury) {
      document.body.classList.add('alberto');
      document.getElementById('brand').hidden = false;
      document.querySelector('meta[name="theme-color"]').content = '#0a0b0e';
    }
    const code = document.getElementById('errorCode');
    const title = document.getElementById('headline');
    const description = document.getElementById('description');
    const button = document.getElementById('homeButton');
    const status = document.getElementById('status');
    if (offline) {
      code.textContent = 'OFFLINE';
      code.style.fontSize = 'clamp(41px,7vw,64px)';
      title.textContent = 'Your connection is lost';
      description.textContent = 'Please check your internet connection and try again.';
      button.textContent = 'Try Reconnecting';
      button.href = '#';
      button.addEventListener('click', async event => {
        event.preventDefault();
        status.textContent = 'Checking connection…';
        if (!navigator.onLine) { status.textContent = 'Still offline. Try again shortly.'; return; }
        try {
          const home = new URL('../index.html', location.href);
          const response = await fetch(home.href + '?check=' + Date.now(), {cache:'no-store',signal:AbortSignal.timeout(5500)});
          if (!response.ok) throw new Error('Site unavailable');
          const back = sessionStorage.getItem('albertoReturn') || home.href;
          location.replace(new URL(back, location.origin).origin === location.origin ? back : home.href);
        } catch(e) {status.textContent = 'Connection not ready yet.';}
      });
      window.addEventListener('online', () => button.click());
    }
  })();
