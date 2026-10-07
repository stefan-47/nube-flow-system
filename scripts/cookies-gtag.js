(function () {
  "use strict";

  const STORAGE_KEY = "nf-cookie-consent";
  const OPTIONAL = ["personalization", "analytics", "marketing"];
  const ALL = ["essentials", ...OPTIONAL];
  const BLOCKED_SCRIPT = 'script[type="text/plain"]';

  const currentScript = document.currentScript;
  const readAttr = (name) => currentScript?.getAttribute(name);

  const USE_TRIGGER = readAttr("nf-trigger") === "true";
  const OPT_OUT = readAttr("nf-optout") === "true";
  const VERSION = readAttr("nf-consent-version") || "1.0";
  const parsedExpiry = parseInt(readAttr("nf-consent-expiry") || "30", 10);
  const EXPIRY_DAYS = parsedExpiry > 0 ? parsedExpiry : 30;

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    personalization_storage: "denied",
    wait_for_update: 500
  });

  window.nf = window.nf || {};
  window.nf.cookies = window.nf.cookies || {};
  const api = window.nf.cookies;

  const hide = (el) => {
    if (el) el.style.display = "none";
  };

  const show = (el) => {
    if (el) el.style.display = "";
  };

  const emit = (name, detail) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const normalize = (categories) =>
    ALL.filter((c) => c === "essentials" || categories.includes(c));

  function saveConsent(categories, clearCookiesOnLoad = false) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories,
          timestamp: new Date().toISOString(),
          clearCookiesOnLoad,
          version: VERSION,
          expiryDays: EXPIRY_DAYS
        })
      );
    } catch (err) {
      console.error("Cookie script: could not save consent", err);
    }
  }

  function isValidConsent(consent) {
    if (!consent || !consent.timestamp || !Array.isArray(consent.categories)) {
      return false;
    }
    if (consent.version !== VERSION) return false;

    const expires = new Date(consent.timestamp);
    if (Number.isNaN(expires.getTime())) return false;

    expires.setDate(expires.getDate() + (consent.expiryDays || EXPIRY_DAYS));
    return new Date() <= expires;
  }

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const consent = JSON.parse(raw);
      if (isValidConsent(consent)) return consent;

      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    return null;
  }

  function clearCookies() {
    const names = document.cookie
      .split(";")
      .map((c) => c.split("=")[0].trim())
      .filter(Boolean);
    if (!names.length) return;

    const host = window.location.hostname;
    const labels = host.split(".");

    const domains = new Set(["", host, `.${host}`]);
    for (let i = 1; i <= labels.length - 2; i++) {
      domains.add(`.${labels.slice(i).join(".")}`);
    }

    const paths = ["/"];
    window.location.pathname
      .split("/")
      .filter(Boolean)
      .reduce((acc, segment) => {
        const next = `${acc}/${segment}`;
        paths.push(next);
        return next;
      }, "");

    const variants = ["", "; SameSite=Lax", "; SameSite=None; Secure"];
    const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

    names.forEach((name) => {
      paths.forEach((path) => {
        domains.forEach((domain) => {
          const domainPart = domain ? `; domain=${domain}` : "";
          variants.forEach((variant) => {
            document.cookie = `${name}=; ${expired}; path=${path}${domainPart}${variant}`;
          });
        });
      });
    });
  }

  function updateGtagConsent(categories) {
    const granted = (category) =>
      categories.includes(category) ? "granted" : "denied";

    gtag("consent", "update", {
      ad_storage: granted("marketing"),
      ad_user_data: granted("marketing"),
      ad_personalization: granted("marketing"),
      analytics_storage: granted("analytics"),
      personalization_storage: granted("personalization")
    });
  }

  function updateClarityConsent(categories) {
    const send = () => {
      if (typeof window.clarity !== "function") return false;
      try {
        window.clarity("consentv2", {
          ad_Storage: categories.includes("marketing") ? "granted" : "denied",
          analytics_Storage: categories.includes("analytics")
            ? "granted"
            : "denied"
        });
      } catch (err) {
        console.error("Clarity consent error:", err);
      }
      return true;
    };

    if (send()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (send() || attempts >= 20) clearInterval(timer);
    }, 100);
  }

  function activateScripts(categories) {
    categories.forEach((category) => {
      document
        .querySelectorAll(`[nf-script="${category}"]`)
        .forEach((container) => {
          const blocked = container.matches(BLOCKED_SCRIPT)
            ? [container]
            : container.querySelectorAll(BLOCKED_SCRIPT);

          blocked.forEach((oldScript) => {
            const newScript = document.createElement("script");

            Array.from(oldScript.attributes).forEach((attr) => {
              if (attr.name !== "type") {
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
  }

  function applyConsent(categories, { gtagAlreadySent = false } = {}) {
    activateScripts(categories);
    updateClarityConsent(categories);

    if (!gtagAlreadySent) updateGtagConsent(categories);

    window.dataLayer.push({ event: "cookie_consent_update" });
    emit("nf-consent-updated", { categories });
  }

  const storedAtLoad = getConsent();
  let gtagSentEarly = false;

  if (storedAtLoad) {
    if (storedAtLoad.clearCookiesOnLoad) {
      clearCookies();

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...storedAtLoad, clearCookiesOnLoad: false })
        );
      } catch (err) {}
    }
    updateGtagConsent(storedAtLoad.categories);
    gtagSentEarly = true;
  }

  function setupAccessibility(card) {
    const toggles = card.querySelectorAll(".cookies_card_option_toggle");
    const optionsPanel = card.querySelector('[nf-cc="options"]');
    const actionsPanel = card.querySelector('[nf-cc="actions"]');

    const syncTabindex = () => {
      const optionsOpen = card.classList.contains("options-open");
      const essentialsToggle = card.querySelector(
        '[nf-cc="essentials"] .cookies_card_option_toggle'
      );

      const optionToggles = Array.from(
        optionsPanel?.querySelectorAll(".cookies_card_option_toggle") || []
      ).filter((el) => el !== essentialsToggle);
      const optionButtons = optionsPanel?.querySelectorAll("button") || [];
      const actionButtons = actionsPanel?.querySelectorAll("button") || [];

      const optionsIndex = optionsOpen ? "0" : "-1";
      const actionsIndex = optionsOpen ? "-1" : "0";

      optionToggles.forEach((el) => el.setAttribute("tabindex", optionsIndex));
      optionButtons.forEach((el) => el.setAttribute("tabindex", optionsIndex));
      actionButtons.forEach((el) => el.setAttribute("tabindex", actionsIndex));

      essentialsToggle?.setAttribute("tabindex", "-1");
    };

    syncTabindex();
    new MutationObserver(syncTabindex).observe(card, {
      attributes: true,
      attributeFilter: ["class"]
    });

    toggles.forEach((toggle) => {
      if (!toggle.hasAttribute("role")) toggle.setAttribute("role", "switch");

      toggle.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          toggle.click();
        }
      });

      const option = toggle.closest(".cookies_card_option");

      const syncChecked = () => {
        toggle.setAttribute(
          "aria-checked",
          option?.classList.contains("option-active") ? "true" : "false"
        );
      };

      syncChecked();
      if (option) {
        new MutationObserver(syncChecked).observe(option, {
          attributes: true,
          attributeFilter: ["class"]
        });
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") card.classList.remove("options-open");
    });

    new MutationObserver(() => {
      if (card.style.display === "none") return;

      const target = card.querySelector(
        'button:not([disabled]):not([tabindex="-1"])'
      );
      if (target) setTimeout(() => target.focus(), 100);
    }).observe(card, { attributes: true, attributeFilter: ["style"] });
  }

  function setupCard(card, trigger, firstVisit) {
    const find = (selector) => card.querySelector(selector);

    const optionsTrigger = find('[nf-cc="options-trigger"]');
    const saveButton = find('[nf-cc="options-save"]');
    const acceptButton = find('[nf-cc="accept"]');
    const rejectButton = find('[nf-cc="reject"]');
    const essentials = find('[nf-cc="essentials"]');
    const toggles = card.querySelectorAll(".cookies_card_option_toggle");

    if (essentials) {
      essentials.classList.add("option-active");

      const essentialsToggle = essentials.querySelector(
        ".cookies_card_option_toggle"
      );
      if (essentialsToggle) {
        essentialsToggle.style.pointerEvents = "none";
        essentialsToggle.style.opacity = "0.5";
      }
    }

    if (OPT_OUT && firstVisit) {
      OPTIONAL.forEach((category) => {
        find(`[nf-cc="${category}"]`)?.classList.add("option-active");
      });
    }

    setupAccessibility(card);

    optionsTrigger?.addEventListener("click", () => {
      card.classList.add("options-open");
      emit("nf-consent-banner-opened", { source: "options-trigger" });
    });

    document.querySelectorAll('[nf-cc="options-trigger"]').forEach((el) => {
      if (card.contains(el)) return;

      el.addEventListener("click", (event) => {
        event.preventDefault();
        show(card);
        card.classList.add("options-open");
        hide(trigger);
        emit("nf-consent-banner-opened", { source: "external-trigger" });
      });
    });

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const option = toggle.closest(".cookies_card_option");
        if (!option || option.getAttribute("nf-cc") === "essentials") return;
        option.classList.toggle("option-active");
      });
    });

    saveButton?.addEventListener("click", () => {
      const selected = ["essentials"];

      OPTIONAL.forEach((category) => {
        const option = find(`[nf-cc="${category}"].cookies_card_option`);
        if (option?.classList.contains("option-active")) {
          selected.push(category);
        }
      });

      saveConsent(selected, true);
      emit("nf-consent-banner-closed", { action: "save", categories: selected });
      window.location.reload();
    });

    acceptButton?.addEventListener("click", () => {
      saveConsent(ALL);
      applyConsent(ALL);
      hide(card);
      show(trigger);
      emit("nf-consent-banner-closed", { action: "accept", categories: ALL });
    });

    rejectButton?.addEventListener("click", () => {
      const categories = ["essentials"];

      saveConsent(categories, true);
      emit("nf-consent-banner-closed", { action: "reject", categories });
      window.location.reload();
    });
  }

  function init() {
    const card = document.querySelector('[nf-cc="card"]');
    let trigger = document.querySelector(".cookies_trigger");

    if (!card) {
      console.error(
        'Cookie script: Cookie card ([nf-cc="card"]) not found in page'
      );
    }

    card?.classList.remove("options-open");

    hide(trigger);
    if (!USE_TRIGGER) trigger = null;

    const stored = getConsent();
    const firstVisit = !stored;

    if (stored) {

      ALL.forEach((category) => {
        card
          ?.querySelector(`[nf-cc="${category}"]`)
          ?.classList.toggle(
            "option-active",
            stored.categories.includes(category)
          );
      });

      hide(card);
      show(trigger);
      applyConsent(stored.categories, { gtagAlreadySent: gtagSentEarly });
    } else if (OPT_OUT) {
      applyConsent(ALL);
    }

    if (card) setupCard(card, trigger, firstVisit);

    api.openConsent = function () {
      if (!card) return;
      show(card);
      card.classList.add("options-open");
      hide(trigger);
      emit("nf-consent-banner-opened", { source: "programmatic" });
    };

    api.getConsent = getConsent;

    api.updateConsent = function (categories) {
      if (!Array.isArray(categories)) {
        console.error("updateConsent requires an array of categories");
        return;
      }
      saveConsent(normalize(categories), true);
      window.location.reload();
    };

    api.revokeConsent = function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {}
      clearCookies();
      window.location.reload();
    };

    api.acceptAll = function () {
      saveConsent(ALL);
      applyConsent(ALL);
      hide(card);
      show(trigger);
      emit("nf-consent-banner-closed", {
        action: "accept-all-programmatic",
        categories: ALL
      });
    };

    api.rejectAll = function () {
      const categories = ["essentials"];

      saveConsent(categories, true);
      emit("nf-consent-banner-closed", {
        action: "reject-all-programmatic",
        categories
      });
      window.location.reload();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();