# Cookie Consent System - Documentation

A lightweight, GDPR-compliant cookie consent system with automatic script blocking, consent management, and third-party API integration.

---

## Quick Start

### 1. Create Your Cookie Banner (Webflow)

Design your cookie banner in Webflow with the required structure and attributes:

```html
<div class="cookies_kit">
  <!-- Main Cookie Card -->
  <div nf-cc="card" class="cookies_card" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
    <div class="cookies_card_content">

      <!-- Title & Description -->
      <div id="cookie-title" class="cookies_card_title">Cookie Settings</div>
      <div id="cookie-desc" class="cookies_card_text">
        We use cookies to enhance your experience. Read our
        <a href="/legal/privacy-policy">Privacy Policy</a>.
      </div>

      <!-- Options Panel (initially hidden) -->
      <div nf-cc="options" class="cookies_card_options_wrapper">
        <div class="cookies_card_options">

          <!-- Essentials (always enabled) -->
          <div nf-cc="essentials" class="cookies_card_option">
            <div class="cookies_card_option_head">
              <div class="cookies_card_option_title">Essentials</div>
              <div class="cookies_card_option_toggle" role="switch" aria-checked="true" aria-label="Essential cookies" aria-readonly="true" tabindex="-1">
                <div class="cookies_card_option_toggle_dot"></div>
              </div>
            </div>
            <p>Security and basic functionality. Must be enabled.</p>
          </div>

          <!-- Personalization -->
          <div nf-cc="personalization" class="cookies_card_option">
            <div class="cookies_card_option_head">
              <div class="cookies_card_option_title">Personalization</div>
              <div class="cookies_card_option_toggle" role="switch" aria-checked="false" aria-label="Personalization cookies" tabindex="0">
                <div class="cookies_card_option_toggle_dot"></div>
              </div>
            </div>
            <p>Personalized preferences and content.</p>
          </div>

          <!-- Analytics -->
          <div nf-cc="analytics" class="cookies_card_option">
            <div class="cookies_card_option_head">
              <div class="cookies_card_option_title">Analytics</div>
              <div class="cookies_card_option_toggle" role="switch" aria-checked="false" aria-label="Analytics cookies" tabindex="0">
                <div class="cookies_card_option_toggle_dot"></div>
              </div>
            </div>
            <p>Performance and activity tracking.</p>
          </div>

          <!-- Marketing -->
          <div nf-cc="marketing" class="cookies_card_option">
            <div class="cookies_card_option_head">
              <div class="cookies_card_option_title">Marketing</div>
              <div class="cookies_card_option_toggle" role="switch" aria-checked="false" aria-label="Marketing cookies" tabindex="0">
                <div class="cookies_card_option_toggle_dot"></div>
              </div>
            </div>
            <p>Ad personalization and tracking.</p>
          </div>

          <!-- Save Button -->
          <button nf-cc="options-save" type="button" aria-label="Save cookie preferences">
            Save Preferences
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div nf-cc="actions" class="cookies_card_actions">
        <button nf-cc="accept" type="button" aria-label="Accept all cookies">Accept</button>
        <button nf-cc="reject" type="button" aria-label="Reject all non-essential cookies">Reject</button>
        <button nf-cc="options-trigger" type="button" aria-label="Customize cookie preferences">Customize</button>
      </div>

    </div>
  </div>

  <!-- Floating Trigger Button (optional) -->
  <button nf-cc="options-trigger" class="cookies_trigger" aria-label="Manage cookie settings">
    <!-- Cookie icon SVG -->
  </button>
</div>
```

### 2. Add Script to Your Site

Include the cookie kit HTML directly in your page (e.g., in a Webflow symbol), then add the script in Webflow Project Settings → Custom Code → Footer Code:

```html
<script src="https://your-domain.com/scripts/cookies.js"></script>
```

The script will automatically find the `[nf-cc="card"]` element in your page.

### 3. Block Third-Party Scripts

Wrap tracking scripts in containers with category attributes:

```html
<!-- Analytics Scripts -->
<div nf-script="analytics">
  <script type="text/plain">
    (function(c,l,a,r,i,t,y){
      // Microsoft Clarity code here
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
  </script>
</div>

<!-- Marketing Scripts -->
<div nf-script="marketing">
  <script type="text/plain">
    // Google Ads or Meta Pixel code here
  </script>
</div>
```

---

## Script Attributes

All attributes are optional:

| Attribute | Default | Description | Example |
|-----------|---------|-------------|---------|
| `nf-trigger` | `false` | Enable floating trigger button (`.cookies_trigger` element) | `nf-trigger="true"` |
| `nf-optout` | `false` | Consent mode: `"true"` for opt-out, `"geo"` for geo-based | `nf-optout="geo"` |
| `nf-consent-expiry` | `30` | Days until consent expires | `nf-consent-expiry="90"` |
| `nf-consent-version` | `1.0` | Version of privacy policy | `nf-consent-version="2.0"` |

### Example Configurations

**Basic (Opt-in):**
```html
<script src="cookies.js"></script>
```

**With Trigger Button (Opt-in):**
```html
<script src="cookies.js" nf-trigger="true"></script>
```

**Opt-out Mode:**
```html
<script src="cookies.js" nf-optout="true" nf-trigger="true"></script>
```

**Geo-based Mode (opt-in for EU/EEA, opt-out elsewhere):**
```html
<script src="cookies.js" nf-optout="geo" nf-trigger="true"></script>
```

**Custom Expiry & Versioning:**
```html
<script src="cookies.js" nf-consent-expiry="90" nf-consent-version="2.0"></script>
```

---

## HTML Attributes Reference

### Cookie Banner Structure

| Attribute | Element | Description |
|-----------|---------|-------------|
| `nf-cc="card"` | Container | Main cookie card modal |
| `nf-cc="options"` | Container | Options panel wrapper |
| `nf-cc="actions"` | Container | Action buttons wrapper |

### Category Options

| Attribute | Element | Description |
|-----------|---------|-------------|
| `nf-cc="essentials"` | Option | Essential cookies (always enabled) |
| `nf-cc="personalization"` | Option | Personalization cookies |
| `nf-cc="analytics"` | Option | Analytics cookies |
| `nf-cc="marketing"` | Option | Marketing cookies |

### Buttons

| Attribute | Element | Description |
|-----------|---------|-------------|
| `nf-cc="accept"` | Button | Accept all cookies |
| `nf-cc="reject"` | Button | Reject all non-essential |
| `nf-cc="options-trigger"` | Button | Open customization panel |
| `nf-cc="options-save"` | Button | Save custom preferences |

### Script Containers

| Attribute | Element | Description |
|-----------|---------|-------------|
| `nf-script="essentials"` | Container | Essential scripts |
| `nf-script="personalization"` | Container | Personalization scripts |
| `nf-script="analytics"` | Container | Analytics scripts |
| `nf-script="marketing"` | Container | Marketing scripts |

---

## Script Blocking

### How It Works

1. Wrap third-party scripts in a container with `nf-script="category"`
2. Change script `type` to `text/plain` to prevent execution
3. Scripts load only when user consents to that category

### Example: Microsoft Clarity

```html
<div nf-script="analytics">
  <script type="text/plain">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
  </script>
</div>
```

### Example: Google Analytics

```html
<div nf-script="analytics">
  <script type="text/plain" async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script type="text/plain">
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</div>
```

### Example: Meta Pixel

```html
<div nf-script="marketing">
  <script type="text/plain">
    !function(f,b,e,v,n,t,s){
      // Meta Pixel code here
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  </script>
</div>
```

---

## Programmatic API

Access cookie consent system programmatically via `window.nf.cookies`:

### Available Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `openConsent()` | Opens the cookie consent banner | `void` |
| `getConsent()` | Returns current consent data | `object` or `null` |
| `updateConsent(categories)` | Updates consent with specified categories (reloads page) | `void` |
| `acceptAll()` | Accepts all cookie categories | `void` |
| `rejectAll()` | Rejects all non-essential cookies (reloads page) | `void` |
| `revokeConsent()` | Completely removes consent and deletes all cookies (reloads page) | `void` |

### Usage Examples

**Open consent banner programmatically:**
```javascript
// From a footer "Cookie Settings" link
document.querySelector('#cookie-settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.nf.cookies.openConsent();
});
```

**Check current consent:**
```javascript
const consent = window.nf.cookies.getConsent();
if (consent && consent.categories.includes('analytics')) {
  console.log('Analytics enabled');
}
```

**Update consent categories:**
```javascript
// Enable only essentials and analytics
window.nf.cookies.updateConsent(['essentials', 'analytics']);
```

**Accept all cookies:**
```javascript
window.nf.cookies.acceptAll();
```

**Revoke all consent (GDPR "Right to be Forgotten"):**
```javascript
// Complete reset - removes consent and deletes all cookies
window.nf.cookies.revokeConsent();
```

### Custom Events

Listen for banner interactions:

| Event | When Fired | Detail Object |
|-------|------------|---------------|
| `nf-consent-banner-opened` | Banner is opened | `{ source: 'options-trigger' \| 'external-trigger' \| 'programmatic' }` |
| `nf-consent-banner-closed` | Banner is closed | `{ action: string, categories: array }` |
| `nf-consent-updated` | Consent preferences change | `{ categories: array }` |

**Example: Track banner interactions:**
```javascript
window.addEventListener('nf-consent-banner-opened', (event) => {
  console.log('Banner opened from:', event.detail.source);
});

window.addEventListener('nf-consent-banner-closed', (event) => {
  console.log('User action:', event.detail.action);
  console.log('Categories:', event.detail.categories);
});
```

---

## Custom Triggers

Add cookie settings link anywhere (e.g., footer):

```html
<a href="#" nf-cc="options-trigger">Cookie Settings</a>
```

Works on any element with `nf-cc="options-trigger"` attribute.

**Or use JavaScript:**
```html
<a href="#" id="cookie-link">Cookie Settings</a>
<script>
document.getElementById('cookie-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.nf.cookies.openConsent();
});
</script>
```

---

## Third-Party Integrations

### Automatically Supported

The system automatically sends consent signals to:

- **Microsoft Clarity** (Consent API v2)
- **Google Analytics** (Consent Mode)
- **Google Ads** (Consent Mode)

### Custom Integration

Listen for consent updates using the `nf-consent-updated` event:

```javascript
window.addEventListener('nf-consent-updated', (event) => {
  const categories = event.detail.categories;
  console.log('User consented to:', categories);

  // Custom integration logic
  if (categories.includes('analytics')) {
    // Initialize your analytics tool
  }
});
```

Or check consent status programmatically:

```javascript
const consent = window.nf.cookies.getConsent();
if (consent && consent.categories.includes('marketing')) {
  // Initialize marketing tools
}
```

---

## Consent Categories

| Category | Description | Use Cases |
|----------|-------------|-----------|
| `essentials` | Required for basic functionality | Session management, security, authentication |
| `personalization` | Personalized user experience | Theme preferences, language settings, UI state |
| `analytics` | Usage tracking & analysis | Google Analytics, Microsoft Clarity, Hotjar |
| `marketing` | Advertising & retargeting | Google Ads, Meta Pixel, LinkedIn Insight |

---

## User Flows

### Opt-In Mode (Default)
1. User visits site → Banner shows
2. User clicks **Accept** → All categories enabled, scripts load
3. User clicks **Reject** → Only essentials enabled, page reloads
4. User clicks **Customize** → Options panel opens, user selects categories

### Opt-Out Mode
1. User visits site → Banner shows, all scripts load immediately
2. User can ignore (implicit consent) or click **Reject** to opt-out
3. User clicks **Customize** → Disable specific categories

### Geo-based Mode (`nf-optout="geo"`)
1. User visits site → Geo-IP lookup determines visitor region (cached for 24h)
2. **EU/EEA/UK/Switzerland visitors** → Opt-in behavior (scripts blocked until consent)
3. **All other visitors** → Opt-out behavior (scripts load immediately)
4. If geo lookup fails → Defaults to opt-in (GDPR-safe fallback)

**Covered GDPR jurisdictions:** AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE, IS, LI, NO, GB, CH

---

## Consent Management

### Expiry
- Consent automatically expires after configured days (default: 30)
- User sees banner again after expiry
- Previous choices pre-selected

### Versioning
- Increment `nf-consent-version` when privacy policy changes
- Users with old version see banner again
- Previous choices pre-selected

### Re-consent Trigger
Change version in script tag:
```html
<script src="cookies.js" nf-consent-version="2.0"></script>
```

---

## Accessibility

### Keyboard Navigation
- **Tab** - Navigate between buttons/toggles
- **Space/Enter** - Activate buttons/toggles
- **Escape** - Open options panel

### Screen Readers
- All elements have proper ARIA labels
- Focus management for modal
- Dynamic `aria-checked` updates

### Features
- Hidden elements are non-focusable
- Essentials toggle visually disabled
- Auto-focus on modal show

---

## CSS Classes

Apply these classes for styling:

| Class | Element | State |
|-------|---------|-------|
| `.cookies_card` | Main modal | Banner container |
| `.cookies_card.options-open` | Main modal | Options panel visible |
| `.cookies_card_option` | Option row | Category option |
| `.cookies_card_option.option-active` | Option row | Category enabled |
| `.cookies_trigger` | Button | Floating trigger |

---

## Storage

### localStorage Key: `nf-cookie-consent`

Stored data structure:
```json
{
  "categories": ["essentials", "analytics"],
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "1.0",
  "expiryDays": 30,
  "clearCookiesOnLoad": false
}
```

### localStorage Key: `nf-geo-region` (Geo mode only)

Cached geo-IP result to avoid repeated API calls:
```json
{
  "countryCode": "US",
  "timestamp": 1713700000000
}
```

Cache expires after 24 hours, then a fresh lookup is performed.

---

## Troubleshooting

### Banner Not Showing
- Verify cookie kit HTML with `[nf-cc="card"]` exists in the page
- Ensure the script loads after the DOM elements are present
- Check browser console for errors

### Scripts Not Loading
- Ensure scripts wrapped in `nf-script="category"` container
- Verify script `type="text/plain"`
- Check browser console for errors

### Consent Not Persisting
- Check localStorage is enabled
- Verify no extensions blocking storage
- Check for conflicting scripts clearing storage

### Clarity Not Receiving Consent
- Ensure Clarity script in `nf-script="analytics"` container
- Verify Clarity loads before consent signal (retry mechanism handles this)
- Check console for "Clarity consent signaled" message

---

## Best Practices

1. **Use a symbol** - Include cookie kit as a Webflow symbol for easy management across pages
2. **Test both modes** - Try opt-in and opt-out
3. **Update version** - Increment when privacy policy changes
4. **Monitor console** - Check for integration errors
5. **Test accessibility** - Use keyboard navigation
6. **Verify blocking** - Check scripts don't load before consent

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6+ support
- localStorage
- MutationObserver

---

## License

Use freely in your Webflow projects.
