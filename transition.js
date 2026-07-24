(() => {
  const TRANSITION_KEY = 'arkkhe-route-transition';
  const SKY_POSITION_KEY = 'arkkhe-route-sky-position';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrival = sessionStorage.getItem(TRANSITION_KEY);
  const homeLayerSources = ['assets/sky.png', 'assets/background.png', 'assets/left.png', 'assets/right.png'];
  let homeLayersReady;
  const setNavigationActive = (label) => {
    document.querySelectorAll('.topbar nav a').forEach((anchor) => {
      const isActive = anchor.textContent.trim() === label;
      anchor.classList.toggle('active', isActive);
      if (isActive) anchor.setAttribute('aria-current', 'page');
      else anchor.removeAttribute('aria-current');
    });
  };
  const ensureHomeLayersReady = () => {
    if (homeLayersReady) return homeLayersReady;
    homeLayersReady = Promise.all(homeLayerSources.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = async () => {
        try { await image.decode?.(); } catch (_) { /* The loaded bitmap is still usable. */ }
        resolve();
      };
      image.onerror = resolve;
      image.src = src;
    })));
    return homeLayersReady;
  };

  const resetHeroPosition = () => {
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.scrollLeft = 0;
      hero.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  };

  const localHeroAnchors = new Set(['#home', '#experiences']);

  if (localHeroAnchors.has(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    requestAnimationFrame(resetHeroPosition);
  }

  if (arrival) {
    sessionStorage.removeItem(TRANSITION_KEY);
    if (arrival === 'from-home' && document.querySelector('.studio-hero,.premium-hero,.technology-hero')) {
      document.body.classList.add('is-page-arrival');
    }
    if (arrival === 'return-home' && document.querySelector('.hero')) {
      document.body.classList.add('is-route-arrival');
      const homeHero = document.querySelector('.hero');
      homeHero.classList.add('is-route-reversing');
      requestAnimationFrame(resetHeroPosition);
      window.setTimeout(() => {
        homeHero.classList.remove('is-route-reversing');
        resetHeroPosition();
      }, reducedMotion ? 240 : 1950);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    let url = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    const homeHero = document.querySelector('.hero');
    const isInternalBrand = link.matches('.brand,[data-home-transition]') && !homeHero;

    // The central brand is the universal return control on every internal page.
    // Normalize its destination so future pages inherit the same reverse flow.
    if (isInternalBrand) url = new URL('index.html', current);
    if (url.origin === current.origin && url.pathname === current.pathname && localHeroAnchors.has(url.hash)) {
      event.preventDefault();
      history.replaceState(null, '', current.pathname + current.search);
      resetHeroPosition();
      return;
    }

    const isPageRoute = url.origin === current.origin && url.pathname !== current.pathname && /\.html$/.test(url.pathname);
    if (!isPageRoute) return;

    event.preventDefault();
    if (document.body.classList.contains('route-native-tunnel') || document.body.classList.contains('route-reverse-leaving')) return;
    resetHeroPosition();

    const isTechnologyDestination = url.pathname.endsWith('/technologies.html');
    if (isTechnologyDestination && !homeHero) {
      sessionStorage.setItem(TRANSITION_KEY, 'technology-direct');

      const preview = document.createElement('div');
      preview.className = 'route-page-preview route-page-preview--technologies';
      preview.innerHTML = '<div class="route-page-preview__technology-image" aria-hidden="true"></div><div class="route-page-preview__technology-ground" aria-hidden="true"></div><div class="route-page-preview__technology-mesh" aria-hidden="true"></div><div class="route-page-preview__technology-scan" aria-hidden="true"></div><div class="route-page-preview__frame" aria-hidden="true"></div><p class="route-page-preview__technology-eyebrow"><span>Arkkhe / Applied imagination</span><span>São Paulo · Worldwide</span></p><h2><span>Technology</span><strong>that feels alive.</strong></h2><p class="route-page-preview__technology-intro">We turn intelligence, space and motion into experiences that respond, evolve and stay with you.</p><aside class="route-page-preview__technology-readout"><span>Live systems / 04</span><div><b>87</b><i>%</i></div><p>Human signal detected<br />Experience adapting</p></aside><div class="route-page-preview__technology-coordinates" aria-hidden="true"><span>23°33′S</span><span>046°38′W</span><span>FRAME / 001</span></div><div class="route-page-preview__technology-cue"><span>Enter the system</span><i>↓</i></div>';
      document.body.appendChild(preview);

      const routeNav = document.querySelector('.topbar');
      setNavigationActive('Technologies');
      if (routeNav) document.body.appendChild(routeNav);

      const destinationImage = new Image();
      let destinationStarted = false;
      const showDestination = async () => {
        if (destinationStarted) return;
        destinationStarted = true;
        try { await destinationImage.decode?.(); } catch (_) { /* The cached bitmap remains usable. */ }
        document.body.classList.add('route-direct-technology');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.body.classList.add('is-technology-preview-visible');
        }));
        window.setTimeout(() => {
          window.location.href = url.href;
        }, reducedMotion ? 80 : 1050);
      };
      destinationImage.onload = showDestination;
      destinationImage.onerror = showDestination;
      destinationImage.src = 'assets/sky_technologie_1.webp';
      if (destinationImage.complete) showDestination();
      return;
    }

    if (homeHero) {
      const pointerX = event.clientX / window.innerWidth - 0.5;
      const pointerY = event.clientY / window.innerHeight - 0.5;
      sessionStorage.setItem(SKY_POSITION_KEY, JSON.stringify({
        nx: pointerX,
        ny: pointerY,
        x: `${pointerX * -128}px`,
        y: `${pointerY * -70}px`,
        groundX: '0px',
        groundY: '0px',
        cloudX: '0px',
        cloudY: '0px'
      }));
      sessionStorage.setItem(TRANSITION_KEY, isTechnologyDestination ? 'technology-tunnel' : 'from-home');
      document.body.classList.add('route-native-tunnel');
      if (isTechnologyDestination) document.body.classList.add('route-technology-tunnel');
      homeHero.classList.add('is-route-page-dive');
      if (url.pathname.endsWith('/studio.html')) {
        setNavigationActive('Studio');
        const preview = document.createElement('div');
        preview.className = 'route-page-preview';
        preview.innerHTML = '<div class="route-page-preview__halo" aria-hidden="true"><i></i><i></i><i></i></div><div class="route-page-preview__frame" aria-hidden="true"></div><h2><span>Architects of</span><strong>the unseen</strong></h2><p>We shape digital worlds where imagination becomes tangible — and every interaction opens a door to wonder.</p><aside class="route-page-preview__ledger"><span>One vision / three forces</span><ol><li><b>01</b> Strategy</li><li><b>02</b> Design</li><li><b>03</b> Technology</li></ol></aside><div class="route-page-preview__cue"><span>Discover our world</span><i>↓</i></div>';
        document.querySelector('.reality')?.appendChild(preview);
      }
      if (url.pathname.endsWith('/premium.html')) {
        setNavigationActive('Experiences');
        const preview = document.createElement('div');
        preview.className = 'route-page-preview route-page-preview--premium';
        preview.innerHTML = '<div class="route-page-preview__premium-sky" aria-hidden="true"></div><div class="route-page-preview__premium-veil" aria-hidden="true"></div><div class="route-page-preview__premium-portal" aria-hidden="true"><i></i><i></i><i></i></div><figure class="route-page-preview__premium-artifact" aria-hidden="true"><img src="assets/premium-portal.jpg" alt="" /></figure><div class="route-page-preview__frame" aria-hidden="true"></div><p class="route-page-preview__premium-eyebrow"><span>Private access</span><span>By Arkkhe</span></p><h2><span>Beyond</span><strong>ordinary</strong></h2><p class="route-page-preview__premium-intro">Rare places. Singular moments. Every journey imagined around one person: you.</p><aside class="route-page-preview__premium-edition"><span>Edition / 01</span><b>∞</b><p>Designed without limits.<br />Available by invitation.</p></aside><div class="route-page-preview__cue"><span>Enter the rare</span><i>↓</i></div>';
        document.querySelector('.reality')?.appendChild(preview);
      }
      if (isTechnologyDestination) {
        setNavigationActive('Technologies');
        const preview = document.createElement('div');
        preview.className = 'route-page-preview route-page-preview--technologies';
        preview.innerHTML = '<div class="route-page-preview__technology-image" aria-hidden="true"></div><div class="route-page-preview__technology-ground" aria-hidden="true"></div><div class="route-page-preview__technology-mesh" aria-hidden="true"></div><div class="route-page-preview__technology-scan" aria-hidden="true"></div><div class="route-page-preview__frame" aria-hidden="true"></div><p class="route-page-preview__technology-eyebrow"><span>Arkkhe / Applied imagination</span><span>São Paulo · Worldwide</span></p><h2><span>Technology</span><strong>that feels alive.</strong></h2><p class="route-page-preview__technology-intro">We turn intelligence, space and motion into experiences that respond, evolve and stay with you.</p><aside class="route-page-preview__technology-readout"><span>Live systems / 04</span><div><b>87</b><i>%</i></div><p>Human signal detected<br />Experience adapting</p></aside><div class="route-page-preview__technology-coordinates" aria-hidden="true"><span>23°33′S</span><span>046°38′W</span><span>FRAME / 001</span></div><div class="route-page-preview__technology-cue"><span>Enter the system</span><i>↓</i></div>';
        document.querySelector('.reality')?.appendChild(preview);
      }
      document.querySelector('.enter')?.click();
      window.setTimeout(() => {
        window.location.href = url.href;
      }, reducedMotion ? 220 : 3350);
      return;
    }

    const isHomeDestination = /\/(?:index\.html)?$/.test(url.pathname);
    if (!isHomeDestination) {
      window.location.href = url.href;
      return;
    }

    sessionStorage.setItem(TRANSITION_KEY, 'return-home');
    document.body.classList.add('route-reverse-leaving');
    ensureHomeLayersReady().finally(() => {
      window.setTimeout(() => {
        window.location.href = url.href;
      }, reducedMotion ? 20 : 70);
    });
  });
})();
