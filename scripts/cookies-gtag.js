(function() {
  'use strict';

  // Create global namespace for programmatic access
  const cookieSystem = ((window.nf ??= {}).cookies ??= {});

  const currentScript = document.currentScript;
  const includeTrigger = currentScript?.getAttribute('nf-trigger') === 'true';
  const optOutMode = currentScript?.getAttribute('nf-optout') || 'false';
  const isGeoOpt = optOutMode === 'geo';
  let isOptOut = optOutMode === 'true';
  const consentExpiry = parseInt(currentScript?.getAttribute('nf-consent-expiry') || '30', 10);
  const consentVersion = currentScript?.getAttribute('nf-consent-version') || '1.0';

  // EU/EEA + UK + Switzerland (GDPR-equivalent jurisdictions)
  const GDPR_COUNTRIES = [
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR',
    'HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK',
    'SI','ES','SE','IS','LI','NO','GB','CH'
  ];

  const GEO_CACHE_KEY = 'nf-geo-region';
  const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;

  async function resolveGeoOptOut() {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < GEO_CACHE_TTL) {
          return !GDPR_COUNTRIES.includes(data.countryCode);
        }
      } catch (e) {}
    }

    try {
      const response = await fetch('https://ipapi.co/country_code/', {
        signal: AbortSignal.timeout(3000)
      });
      const countryCode = (await response.text()).trim().toUpperCase();

      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({
        countryCode: countryCode,
        timestamp: Date.now()
      }));

      return !GDPR_COUNTRIES.includes(countryCode);
    } catch (e) {
      return false;
    }
  }

  function hideElement(element) {
    if (!element) return;
    element.style.display = 'none';
  }

  function showElement(element) {
    if (!element) return;
    element.style.display = '';
  }

  function deleteAllCookies() {
    const cookies = document.cookie.split(';');
    const hostname = window.location.hostname;
    const domains = ['', hostname, `.${hostname}`];
    const parts = hostname.split('.');

    if (parts.length > 2) domains.push(`.${parts.slice(-2).join('.')}`);
    if (parts.length > 3) domains.push(`.${parts.slice(-3).join('.')}`);

    const paths = [
      '/',
      window.location.pathname,
      window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
    ];

    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!name) return;

      domains.forEach(domain => {
        paths.forEach(path => {
          if (domain) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; SameSite=Lax`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; SameSite=None; Secure`;
          }
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=None; Secure`;
        });
      });
    });
  }

  function saveConsent(categories, clearCookiesOnLoad = false) {
    localStorage.setItem('nf-cookie-consent', JSON.stringify({
      categories: categories,
      timestamp: new Date().toISOString(),
      clearCookiesOnLoad: clearCookiesOnLoad,
      version: consentVersion,
      expiryDays: consentExpiry
    }));
  }

  function isConsentValid(consent) {
    if (!consent || !consent.timestamp) return false;
    if (consent.version !== consentVersion) return false;

    const consentDate = new Date(consent.timestamp);
    const expiryDate = new Date(consentDate);
    const daysToUse = consent.expiryDays || consentExpiry;
    expiryDate.setDate(expiryDate.getDate() + daysToUse);

    if (new Date() > expiryDate) return false;
    return true;
  }

  function loadConsent() {
    const stored = localStorage.getItem('nf-cookie-consent');
    if (stored) {
      try {
        const consent = JSON.parse(stored);
        if (!isConsentValid(consent)) {
          localStorage.removeItem('nf-cookie-consent');
          return null;
        }
        return consent;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function signalConsent(categories) {
    const hasAnalytics = categories.includes('analytics');
    const hasMarketing = categories.includes('marketing');

    const signalClarity = () => {
      if (typeof window.clarity === 'function') {
        try {
          window.clarity('consentv2', {
            ad_Storage: hasMarketing ? "granted" : "denied",
            analytics_Storage: hasAnalytics ? "granted" : "denied"
          });
        } catch (error) {
          console.error('Clarity consent error:', error);
        }
      } else {
        return false;
      }
      return true;
    };

    if (!signalClarity()) {
      let attempts = 0;
      const clarityInterval = setInterval(() => {
        attempts++;
        if (signalClarity() || attempts >= 20) {
          clearInterval(clarityInterval);
        }
      }, 100);
    }

    // Signal consent via dataLayer (compatible with both GTM and gtag.js)
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    gtag('consent', 'update', {
      'ad_storage': hasMarketing ? 'granted' : 'denied',
      'ad_user_data': hasMarketing ? 'granted' : 'denied',
      'ad_personalization': hasMarketing ? 'granted' : 'denied',
      'analytics_storage': hasAnalytics ? 'granted' : 'denied',
      'personalization_storage': categories.includes('personalization') ? 'granted' : 'denied'
    });

    window.dataLayer.push({ event: 'cookie_consent_update' });

    window.dispatchEvent(new CustomEvent('nf-consent-updated', {
      detail: { categories: categories }
    }));
  }

  function loadScripts(categories) {
    categories.forEach(category => {
      const scriptContainers = document.querySelectorAll(`[nf-script="${category}"]`);

      scriptContainers.forEach(container => {
        const scripts = container.querySelectorAll('script[type="text/plain"]');

        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');

          Array.from(oldScript.attributes).forEach(attr => {
            if (attr.name !== 'type') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });

          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }

          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
      });
    });

    signalConsent(categories);
  }

  function getActiveCategories(cookiesCard) {
    const categories = ['essentials'];
    const options = ['personalization', 'analytics', 'marketing'];

    options.forEach(option => {
      const optionElement = cookiesCard.querySelector(`[nf-cc="${option}"].cookies_card_option`);
      if (optionElement && optionElement.classList.contains('option-active')) {
        categories.push(option);
      }
    });

    return categories;
  }

  function enhanceAccessibility(cookiesCard) {
    const toggles = cookiesCard.querySelectorAll('.cookies_card_option_toggle');
    const optionsWrapper = cookiesCard.querySelector('[nf-cc="options"]');
    const actionsWrapper = cookiesCard.querySelector('[nf-cc="actions"]');

    const updateFocusableElements = () => {
      const isOptionsOpen = cookiesCard.classList.contains('options-open');
      const essentialsOption = cookiesCard.querySelector('[nf-cc="essentials"]');
      const essentialsToggle = essentialsOption?.querySelector('.cookies_card_option_toggle');
      const optionsToggles = Array.from(optionsWrapper?.querySelectorAll('.cookies_card_option_toggle') || [])
        .filter(toggle => toggle !== essentialsToggle);
      const optionsButtons = optionsWrapper?.querySelectorAll('button') || [];
      const actionsButtons = actionsWrapper?.querySelectorAll('button') || [];

      if (essentialsToggle) {
        essentialsToggle.setAttribute('tabindex', '-1');
      }

      if (isOptionsOpen) {
        optionsToggles.forEach(el => el.setAttribute('tabindex', '0'));
        optionsButtons.forEach(el => el.setAttribute('tabindex', '0'));
        actionsButtons.forEach(el => el.setAttribute('tabindex', '-1'));
      } else {
        optionsToggles.forEach(el => el.setAttribute('tabindex', '-1'));
        optionsButtons.forEach(el => el.setAttribute('tabindex', '-1'));
        actionsButtons.forEach(el => el.setAttribute('tabindex', '0'));
      }
    };

    updateFocusableElements();

    const classObserver = new MutationObserver(updateFocusableElements);
    classObserver.observe(cookiesCard, { attributes: true, attributeFilter: ['class'] });

    toggles.forEach(toggle => {
      toggle.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle.click();
        }
      });

      const updateAriaChecked = () => {
        const option = toggle.closest('.cookies_card_option');
        const isActive = option?.classList.contains('option-active');
        toggle.setAttribute('aria-checked', isActive ? 'true' : 'false');
      };

      updateAriaChecked();

      const observer = new MutationObserver(updateAriaChecked);
      const option = toggle.closest('.cookies_card_option');
      if (option) {
        observer.observe(option, { attributes: true, attributeFilter: ['class'] });
      }
    });

    cookiesCard.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cookiesCard.classList.add('options-open');
      }
    });

    const visibilityObserver = new MutationObserver(() => {
      if (cookiesCard.style.display !== 'none') {
        const firstButton = cookiesCard.querySelector('button:not([disabled]):not([tabindex="-1"])');
        if (firstButton) {
          setTimeout(() => firstButton.focus(), 100);
        }
      }
    });
    visibilityObserver.observe(cookiesCard, { attributes: true, attributeFilter: ['style'] });
  }

  function setupUIInteractions(cookiesCard, cookiesTrigger, isOptOut, isFirstVisit) {
    const optionsTrigger = cookiesCard.querySelector('[nf-cc="options-trigger"]');
    const optionsSave = cookiesCard.querySelector('[nf-cc="options-save"]');
    const optionToggles = cookiesCard.querySelectorAll('.cookies_card_option_toggle');
    const acceptBtn = cookiesCard.querySelector('[nf-cc="accept"]');
    const rejectBtn = cookiesCard.querySelector('[nf-cc="reject"]');
    const essentialsOption = cookiesCard.querySelector('[nf-cc="essentials"]');

    if (essentialsOption) {
      essentialsOption.classList.add('option-active');
      const essentialsToggle = essentialsOption.querySelector('.cookies_card_option_toggle');
      if (essentialsToggle) {
        essentialsToggle.style.pointerEvents = 'none';
        essentialsToggle.style.opacity = '0.5';
      }
    }

    if (isOptOut && isFirstVisit) {
      const allOptions = ['personalization', 'analytics', 'marketing'];
      allOptions.forEach(category => {
        const optionElement = cookiesCard.querySelector(`[nf-cc="${category}"]`);
        if (optionElement && !optionElement.classList.contains('option-active')) {
          optionElement.classList.add('option-active');
        }
      });
    }

    enhanceAccessibility(cookiesCard);

    if (optionsTrigger) {
      optionsTrigger.addEventListener('click', () => {
        cookiesCard.classList.add('options-open');
        window.dispatchEvent(new CustomEvent('nf-consent-banner-opened', {
          detail: { source: 'options-trigger' }
        }));
      });
    }

    const allOptionsTriggers = document.querySelectorAll('[nf-cc="options-trigger"]');
    allOptionsTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        showElement(cookiesCard);
        cookiesCard.classList.add('options-open');
        if (cookiesTrigger) {
          hideElement(cookiesTrigger);
        }
        window.dispatchEvent(new CustomEvent('nf-consent-banner-opened', {
          detail: { source: 'external-trigger' }
        }));
      });
    });

    if (optionsSave) {
      optionsSave.addEventListener('click', () => {
        const activeCategories = getActiveCategories(cookiesCard);
        saveConsent(activeCategories, true);
        window.dispatchEvent(new CustomEvent('nf-consent-banner-closed', {
          detail: { action: 'save', categories: activeCategories }
        }));
        window.location.reload();
      });
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        const allCategories = ['essentials', 'personalization', 'analytics', 'marketing'];
        saveConsent(allCategories);
        loadScripts(allCategories);
        hideElement(cookiesCard);
        if (cookiesTrigger) {
          showElement(cookiesTrigger);
        }
        window.dispatchEvent(new CustomEvent('nf-consent-banner-closed', {
          detail: { action: 'accept', categories: allCategories }
        }));
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        const essentialsOnly = ['essentials'];
        saveConsent(essentialsOnly, true);
        window.dispatchEvent(new CustomEvent('nf-consent-banner-closed', {
          detail: { action: 'reject', categories: essentialsOnly }
        }));
        window.location.reload();
      });
    }

    optionToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const option = toggle.closest('.cookies_card_option');
        if (option) {
          const category = option.getAttribute('nf-cc');
          if (category === 'essentials') {
            return;
          }
          option.classList.toggle('option-active');
        }
      });
    });
  }

  function init() {
    const cookiesCard = document.querySelector('[nf-cc="card"]');

    if (!cookiesCard) {
      console.error('Cookie script: Cookie card ([nf-cc="card"]) not found in page');
      return;
    }

    cookiesCard.classList.remove('options-open');

    let cookiesTrigger = document.querySelector('.cookies_trigger');

    if (includeTrigger) {
      if (cookiesTrigger) {
        hideElement(cookiesTrigger);
      }
    } else if (cookiesTrigger) {
      // Hide trigger permanently if nf-trigger is not enabled
      hideElement(cookiesTrigger);
      cookiesTrigger = null;
    }

    const savedConsent = loadConsent();
    const isFirstVisit = !savedConsent || !savedConsent.categories;

    if (savedConsent && savedConsent.categories) {
      if (savedConsent.clearCookiesOnLoad) {
        deleteAllCookies();
        saveConsent(savedConsent.categories, false);
      }

      const allCategories = ['essentials', 'personalization', 'analytics', 'marketing'];
      allCategories.forEach(category => {
        const optionElement = cookiesCard.querySelector(`[nf-cc="${category}"]`);
        if (optionElement) {
          if (savedConsent.categories.includes(category)) {
            optionElement.classList.add('option-active');
          } else {
            optionElement.classList.remove('option-active');
          }
        }
      });

      hideElement(cookiesCard);
      if (cookiesTrigger) {
        showElement(cookiesTrigger);
      }
      loadScripts(savedConsent.categories);
    } else if (isOptOut) {
      const allCategories = ['essentials', 'personalization', 'analytics', 'marketing'];
      loadScripts(allCategories);
    }

    setupUIInteractions(cookiesCard, cookiesTrigger, isOptOut, isFirstVisit);

    // Expose global API
    cookieSystem.openConsent = function() {
      showElement(cookiesCard);
      cookiesCard.classList.add('options-open');
      if (cookiesTrigger) {
        hideElement(cookiesTrigger);
      }
      window.dispatchEvent(new CustomEvent('nf-consent-banner-opened', {
        detail: { source: 'programmatic' }
      }));
    };

    cookieSystem.getConsent = function() {
      return loadConsent();
    };

    cookieSystem.updateConsent = function(categories) {
      if (!Array.isArray(categories)) {
        console.error('updateConsent requires an array of categories');
        return;
      }
      saveConsent(categories, true);
      window.location.reload();
    };

    cookieSystem.revokeConsent = function() {
      localStorage.removeItem('nf-cookie-consent');
      deleteAllCookies();
      window.location.reload();
    };

    cookieSystem.acceptAll = function() {
      const allCategories = ['essentials', 'personalization', 'analytics', 'marketing'];
      saveConsent(allCategories);
      loadScripts(allCategories);
      hideElement(cookiesCard);
      if (cookiesTrigger) {
        showElement(cookiesTrigger);
      }
      window.dispatchEvent(new CustomEvent('nf-consent-banner-closed', {
        detail: { action: 'accept-all-programmatic', categories: allCategories }
      }));
    };

    cookieSystem.rejectAll = function() {
      const essentialsOnly = ['essentials'];
      saveConsent(essentialsOnly, true);
      window.dispatchEvent(new CustomEvent('nf-consent-banner-closed', {
        detail: { action: 'reject-all-programmatic', categories: essentialsOnly }
      }));
      window.location.reload();
    };
  }

  async function start() {
    if (isGeoOpt) {
      isOptOut = await resolveGeoOptOut();
    }
    init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
