!function() {
  "use strict";

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

  const e = (window.nf ?? {}).cookies ?? {};
  const t = document.currentScript;
  const n = "true" === t?.getAttribute("nf-trigger");
  const o = "true" === t?.getAttribute("nf-optout");
  const i = parseInt(t?.getAttribute("nf-consent-expiry") || "30", 10);
  const a = t?.getAttribute("nf-consent-version") || "1.0";

  function c(e) {
    e && (e.style.display = "none");
  }

  function s(e) {
    e && (e.style.display = "");
  }

  function r() {
    const e = document.cookie.split(";");
    const t = window.location.hostname;
    const n = ["", t, `.${t}`];
    const o = t.split(".");

    o.length > 2 && n.push(`.${o.slice(-2).join(".")}`);
    o.length > 3 && n.push(`.${o.slice(-3).join(".")}`);

    const i = [
      "/",
      window.location.pathname,
      window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/")
      )
    ];

    e.forEach((e => {
      const t = e.split("=")[0].trim();

      t && n.forEach((e => {
        i.forEach((n => {
          e && (
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}; domain=${e}`,
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}; domain=${e}; SameSite=Lax`,
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}; domain=${e}; SameSite=None; Secure`,
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}`,
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}; SameSite=Lax`,
            document.cookie = `${t}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${n}; SameSite=None; Secure`
          );
        });
      });
    });
  }

  function l(e, t = !1) {
    localStorage.setItem(
      "nf-cookie-consent",
      JSON.stringify({
        categories: e,
        timestamp: (new Date).toISOString(),
        clearCookiesOnLoad: t,
        version: a,
        expiryDays: i
      })
    );
  }

  function d() {
    const e = localStorage.getItem("nf-cookie-consent");

    if (e) {
      try {
        const t = JSON.parse(e);

        return function(e) {
          if (!e || !e.timestamp) return !1;
          if (e.version !== a) return !1;

          const t = new Date(e.timestamp);
          const n = new Date(t);
          const o = e.expiryDays || i;

          n.setDate(n.getDate() + o);

          return !(new Date > n);
        }(t)
          ? t
          : (localStorage.removeItem("nf-cookie-consent"), null);

      } catch (e) {
        return null;
      }
    }

    return null;
  }

  function u(e) {
    e.forEach((e => {
      document.querySelectorAll(`[nf-script="${e}"]`).forEach((e => {
        e.querySelectorAll('script[type="text/plain"]').forEach((e => {
          const t = document.createElement("script");

          Array.from(e.attributes).forEach((e => {
            "type" !== e.name && t.setAttribute(e.name, e.value);
          }));

          e.textContent && (t.textContent = e.textContent);
          e.parentNode.replaceChild(t, e);
        });
      });
    }));

    const t = e.includes("analytics");
    const n = e.includes("marketing");

    const o = () => {
      if ("function" != typeof window.clarity) {
        return !1;
      }

      try {
        window.clarity("consentv2", {
          ad_Storage: n ? "granted" : "denied",
          analytics_Storage: t ? "granted" : "denied"
        });
      } catch (e) {
        console.error("Clarity consent error:", e);
      }

      return !0;
    };

    if (!o()) {
      let e = 0;

      const t = setInterval((() => {
        e++;
        (o() || e >= 20) && clearInterval(t);
      }), 100);
    }

    window.dataLayer = window.dataLayer || [];

    gtag("consent", "update", {
      ad_storage: n ? "granted" : "denied",
      ad_user_data: n ? "granted" : "denied",
      ad_personalization: n ? "granted" : "denied",
      analytics_storage: t ? "granted" : "denied",
      personalization_storage: e.includes("personalization")
        ? "granted"
        : "denied"
    });

    window.dataLayer.push({
      event: "cookie_consent_update"
    });

    window.dispatchEvent(
      new CustomEvent("nf-consent-updated", {
        detail: {
          categories: e
        }
      })
    );
  }

  function p(e, t = !1, n, o) {
    const i = e.querySelector('[nf-cc="options-trigger"]');
    const a = e.querySelector('[nf-cc="options-save"]');
    const r = e.querySelectorAll(".cookies_card_option_toggle");
    const d = e.querySelector('[nf-cc="accept"]');
    const p = e.querySelector('[nf-cc="reject"]');
    const f = e.querySelector('[nf-cc="essentials"]');

    if (f) {
      f.classList.add("option-active");

      const e = f.querySelector(".cookies_card_option_toggle");

      e && (
        e.style.pointerEvents = "none",
        e.style.opacity = "0.5"
      );
    }

    if (n && o) {
      ["personalization", "analytics", "marketing"].forEach((t => {
        const n = e.querySelector(`[nf-cc="${t}"]`);

        n &&
          !n.classList.contains("option-active") &&
          n.classList.add("option-active");
      }));
    }

    !function(e) {
      const t = e.querySelectorAll(".cookies_card_option_toggle");
      const n = e.querySelector('[nf-cc="options"]');
      const o = e.querySelector('[nf-cc="actions"]');

      const i = () => {
        const t = e.classList.contains("options-open");
        const i = e.querySelector('[nf-cc="essentials"]');
        const a = i?.querySelector(".cookies_card_option_toggle");
        const c = Array.from(
          n?.querySelectorAll(".cookies_card_option_toggle") || []
        ).filter((e => e !== a));

        const s = n?.querySelectorAll("button") || [];
        const r = o?.querySelectorAll("button") || [];

        a && a.setAttribute("tabindex", "-1");

      t
        ? (
            c.forEach((e => e.setAttribute("tabindex", "0"))),
            s.forEach((e => e.setAttribute("tabindex", "0"))),
            r.forEach((e => e.setAttribute("tabindex", "-1")))
          )
        : (
            c.forEach((e => e.setAttribute("tabindex", "-1"))),
            s.forEach((e => e.setAttribute("tabindex", "-1"))),
            r.forEach((e => e.setAttribute("tabindex", "0")))
          );
      };

      i();

      new MutationObserver(i).observe(e, {
        attributes: !0,
        attributeFilter: ["class"]
      });

      t.forEach((e => {
        e.addEventListener("keydown", (t => {
          (" " !== t.key && "Enter" !== t.key) ||
            (t.preventDefault(), e.click());
        }));

        const t = () => {
          const t = e.closest(".cookies_card_option");
          const n = t?.classList.contains("option-active");

          e.setAttribute(
            "aria-checked",
            n ? "true" : "false"
          );
        };

        t();

        const n = new MutationObserver(t);
        const o = e.closest(".cookies_card_option");

        o &&
          n.observe(o, {
            attributes: !0,
            attributeFilter: ["class"]
          });
      }));

      e.addEventListener("keydown", (t => {
        "Escape" === t.key &&
          e.classList.add("options-open");
      }));

      new MutationObserver((() => {
        if ("none" !== e.style.display) {
          const t = e.querySelector(
            'button:not([disabled]):not([tabindex="-1"])'
          );

          t &&
            setTimeout((() => t.focus()), 100);
        }
      })).observe(e, {
        attributes: !0,
        attributeFilter: ["style"]
      });

    }(e);

    i &&
      i.addEventListener("click", (() => {
        e.classList.add("options-open");

        window.dispatchEvent(
          new CustomEvent("nf-consent-banner-opened", {
            detail: {
              source: "options-trigger"
            }
          })
        );
      }));

    document.querySelectorAll('[nf-cc="options-trigger"]').forEach((n => {
      n.addEventListener("click", (n => {
        n.preventDefault();

        s(e);
        e.classList.add("options-open");

        t && c(t);

        window.dispatchEvent(
          new CustomEvent("nf-consent-banner-opened", {
            detail: {
              source: "external-trigger"
            }
          })
        );
      }));
    }));

    a &&
      a.addEventListener("click", (() => {
        const t = function(e) {
          const t = ["essentials"];

          [
            "personalization",
            "analytics",
            "marketing"
          ].forEach((n => {
            const o = e.querySelector(
              `[nf-cc="${n}"].cookies_card_option`
            );

            o &&
              o.classList.contains("option-active") &&
              t.push(n);
          }));

          return t;
        }(e);

        l(t, !0);

        window.dispatchEvent(
          new CustomEvent("nf-consent-banner-closed", {
            detail: {
              action: "save",
              categories: t
            }
          })
        );

        window.location.reload();
      }));

    d &&
      d.addEventListener("click", (() => {
        const n = [
          "essentials",
          "personalization",
          "analytics",
          "marketing"
        ];

        l(n);
        u(n);
        c(e);
        t && s(t);

        window.dispatchEvent(
          new CustomEvent("nf-consent-banner-closed", {
            detail: {
              action: "accept",
              categories: n
            }
          })
        );
      }));

    p &&
      p.addEventListener("click", (() => {
        const e = ["essentials"];

        l(e, !0);

        window.dispatchEvent(
          new CustomEvent("nf-consent-banner-closed", {
            detail: {
              action: "reject",
              categories: e
            }
          })
        );

        window.location.reload();
      }));

    r.forEach((e => {
      e.addEventListener("click", (() => {
        const t = e.closest(".cookies_card_option");

        if (t) {
          if ("essentials" === t.getAttribute("nf-cc")) {
            return;
          }

          t.classList.toggle("option-active");
        }
      }));
    }));
  }

  function f() {
    const t = document.querySelector('[nf-cc="card"]');

    if (!t) {
      return void console.error(
        'Cookie script: Cookie card ([nf-cc="card"]) not found in page'
      );
    }

    t.classList.remove("options-open");

    let i = document.querySelector(".cookies_trigger");

    n
      ? i && c(i)
      : i && (
          c(i),
          i = null
        );

    const a = d();
    const f = !a || !a.categories;

    if (a && a.categories) {
      a.clearCookiesOnLoad &&
        (
          r(),
          l(a.categories, !1)
        );

      [
        "essentials",
        "personalization",
        "analytics",
        "marketing"
      ].forEach((e => {
        const n = t.querySelector(`[nf-cc="${e}"]`);

        n &&
          (
            a.categories.includes(e)
              ? n.classList.add("option-active")
              : n.classList.remove("option-active")
          );
      }));

      c(t);
      i && s(i);
      u(a.categories);

    } else if (o) {
      u([
        "essentials",
        "personalization",
        "analytics",
        "marketing"
      ]);
    }

    p(t, i, o, f);

    e.openConsent = function() {
      s(t);
      t.classList.add("options-open");
      i && c(i);

      window.dispatchEvent(
        new CustomEvent("nf-consent-banner-opened", {
          detail: {
            source: "programmatic"
          }
        })
      );
    };

    e.getConsent = function() {
      return d();
    };

    e.updateConsent = function(e) {
      Array.isArray(e)
        ? (
            l(e, !0),
            window.location.reload()
          )
        : console.error(
            "updateConsent requires an array of categories"
          );
    };

    e.revokeConsent = function() {
      localStorage.removeItem("nf-cookie-consent");
      r();
      window.location.reload();
    };

    e.acceptAll = function() {
      const e = [
        "essentials",
        "personalization",
        "analytics",
        "marketing"
      ];

      l(e);
      u(e);
      c(t);
      i && s(i);

      window.dispatchEvent(
        new CustomEvent("nf-consent-banner-closed", {
          detail: {
            action: "accept-all-programmatic",
            categories: e
          }
        })
      );
    };

    e.rejectAll = function() {
      const e = ["essentials"];

      l(e, !0);

      window.dispatchEvent(
        new CustomEvent("nf-consent-banner-closed", {
          detail: {
            action: "reject-all-programmatic",
            categories: e
          }
        })
      );

      window.location.reload();
    };
  }

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", f)
    : f();

}();
