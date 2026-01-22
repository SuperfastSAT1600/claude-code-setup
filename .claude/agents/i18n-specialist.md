---
name: i18n-specialist
description: Implement internationalization (i18n) and localization (l10n) for multilingual support
model: sonnet
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
when_to_use:
  - Setting up i18n infrastructure with next-intl or react-i18next
  - Implementing language switching functionality
  - Extracting hardcoded strings for translation
  - Handling pluralization and date/time formatting
  - Implementing RTL (right-to-left) support
  - Managing translation files and workflows
---

# Internationalization (i18n) Specialist Agent

Implement internationalization infrastructure and localization for multilingual applications.

---

## Purpose

Enable applications to support multiple languages and locales with proper formatting for dates, numbers, currencies, and text content.

---

## When to Use

- Adding multilingual support to application
- Expanding to international markets
- Supporting RTL (right-to-left) languages
- Implementing locale-specific formatting
- Managing translation workflows

---

## Capabilities

### i18n Implementation
- Translation library setup (react-i18next, next-intl)
- Namespace organization
- Dynamic locale switching
- Translation key extraction
- Pluralization handling

### Localization
- Date/time formatting
- Number formatting
- Currency formatting
- RTL language support
- Locale-specific content

### Translation Management
- Translation file organization
- Missing translation detection
- Translation interpolation
- Context-aware translations
- Fallback strategies

---

## Setup (Next.js + next-intl)

### 1. Install Dependencies
```bash
npm install next-intl
```

### 2. Project Structure
```
src/
├── i18n/
│   ├── locales/
│   │   ├── en.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── ja.json
│   └── config.ts
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       └── page.tsx
└── middleware.ts
```

### 3. Configure i18n
```typescript
// src/i18n/config.ts
export const locales = ['en', 'es', 'fr', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
};
```

### 4. Middleware for Locale Detection
```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

## Translation Files

### English (en.json)
```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Log in",
    "logout": "Log out",
    "loading": "Loading..."
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "user": {
    "profile": "Profile",
    "settings": "Settings",
    "greeting": "Hello, {name}!",
    "itemCount": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
  },
  "errors": {
    "notFound": "Page not found",
    "serverError": "Something went wrong",
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email",
      "minLength": "Minimum {min} characters required"
    }
  }
}
```

### Spanish (es.json)
```json
{
  "common": {
    "welcome": "Bienvenido",
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "loading": "Cargando..."
  },
  "navigation": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto"
  },
  "user": {
    "profile": "Perfil",
    "settings": "Configuración",
    "greeting": "¡Hola, {name}!",
    "itemCount": "{count, plural, =0 {Sin elementos} =1 {Un elemento} other {# elementos}}"
  }
}
```

---

## Usage in Components

### Basic Translation
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function WelcomeMessage() {
  const t = useTranslations('common');

  return <h1>{t('welcome')}</h1>;
}
```

### With Interpolation
```typescript
const t = useTranslations('user');

<p>{t('greeting', { name: user.name })}</p>
// Output: "Hello, John!"
```

### Pluralization
```typescript
const t = useTranslations('user');

<p>{t('itemCount', { count: items.length })}</p>
// count = 0: "No items"
// count = 1: "One item"
// count = 5: "5 items"
```

### Rich Text Formatting
```typescript
const t = useTranslations('content');

<p>
  {t.rich('terms', {
    link: (chunks) => <a href="/terms">{chunks}</a>,
    bold: (chunks) => <strong>{chunks}</strong>,
  })}
</p>

// Translation: "By signing up, you agree to our <link><bold>Terms of Service</bold></link>"
```

---

## Date & Time Formatting

```typescript
import { useFormatter } from 'next-intl';

function DateDisplay({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <div>
      {/* Full date */}
      <p>{format.dateTime(date, { dateStyle: 'full' })}</p>
      {/* en: "Monday, January 15, 2026" */}
      {/* es: "lunes, 15 de enero de 2026" */}

      {/* Relative time */}
      <p>{format.relativeTime(date)}</p>
      {/* "2 hours ago" / "hace 2 horas" */}

      {/* Custom format */}
      <p>{format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}</p>
    </div>
  );
}
```

---

## Number & Currency Formatting

```typescript
import { useFormatter } from 'next-intl';

function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter();

  return (
    <div>
      {/* Number */}
      <p>{format.number(1234.56)}</p>
      {/* en: "1,234.56" */}
      {/* de: "1.234,56" */}

      {/* Currency */}
      <p>{format.number(amount, { style: 'currency', currency: 'USD' })}</p>
      {/* en: "$1,234.56" */}
      {/* es: "1.234,56 US$" */}

      {/* Percentage */}
      <p>{format.number(0.85, { style: 'percent' })}</p>
      {/* "85%" */}

      {/* File size */}
      <p>{format.number(1024 * 1024, {
        notation: 'compact',
        compactDisplay: 'short',
      })}</p>
      {/* en: "1M" */}
    </div>
  );
}
```

---

## RTL (Right-to-Left) Support

### Detect RTL Locales
```typescript
const rtlLocales = ['ar', 'he', 'fa'] as const;

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as any);
}
```

### Apply RTL Styles
```typescript
// app/[locale]/layout.tsx
import { isRTL } from '@/i18n/config';

export default function Layout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

### RTL-Aware CSS
```css
/* Use logical properties */
.container {
  margin-inline-start: 1rem; /* Left in LTR, right in RTL */
  margin-inline-end: 2rem;   /* Right in LTR, left in RTL */
  padding-inline: 1rem;
}

/* Tailwind CSS with RTL plugin */
<div className="ms-4 me-8">
  <!-- ms = margin-inline-start, me = margin-inline-end -->
</div>
```

---

## Locale Switcher

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Replace locale in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

---

## Translation Workflow

### 1. Extract Translation Keys
```bash
# Create script: scripts/extract-translations.ts
npm run extract-translations
```

### 2. Organize by Namespace
```
locales/
├── en/
│   ├── common.json      # Shared across app
│   ├── navigation.json  # Nav-specific
│   ├── auth.json        # Auth pages
│   ├── dashboard.json   # Dashboard
│   └── errors.json      # Error messages
└── es/
    └── ...
```

### 3. Translation Management Tools
- **Crowdin**: Collaborative translation platform
- **Lokalise**: Professional translation management
- **Weblate**: Open-source translation tool
- **i18n-tasks**: CLI tool for managing translations

### 4. Detect Missing Translations
```typescript
// middleware to log missing translations
import { IntlError, IntlErrorCode } from 'next-intl';

function onError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    console.warn('Missing translation:', error.message);
    // Log to error tracking service
  }
}

export default createMiddleware({
  locales,
  defaultLocale,
  onError,
});
```

---

## Best Practices

### DO
- ✅ Use ICU message format for pluralization
- ✅ Namespace translations logically
- ✅ Provide context in translation keys
- ✅ Use locale-aware date/number formatting
- ✅ Test with actual translations (not Lorem Ipsum)
- ✅ Support RTL languages from the start
- ✅ Keep translation files in sync

### DON'T
- ❌ Concatenate translated strings
- ❌ Hardcode text in components
- ❌ Assume word order is the same across languages
- ❌ Use flags to represent languages
- ❌ Translate technical terms (API, URL, etc.)
- ❌ Store translations in database (use files)

---

## Common Patterns

### Dynamic Translation Keys
```typescript
const t = useTranslations();

// ❌ Bad: String concatenation
const message = t(`errors.${errorCode}`);

// ✅ Good: Use object lookup
const errorKeys = {
  NOT_FOUND: 'errors.notFound',
  SERVER_ERROR: 'errors.serverError',
} as const;

const message = t(errorKeys[errorCode]);
```

### Conditional Content
```typescript
// translations.json
{
  "subscription": {
    "free": "Upgrade to Premium",
    "premium": "Manage Subscription"
  }
}

// Component
const t = useTranslations('subscription');
<button>{t(user.plan)}</button>
```

---

## Testing i18n

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';

test('renders translated content', () => {
  const messages = {
    common: { welcome: 'Welcome' }
  };

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <WelcomeMessage />
    </NextIntlClientProvider>
  );

  expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

---

## Tools

- **Libraries**: next-intl, react-i18next, FormatJS
- **Translation Management**: Crowdin, Lokalise, Phrase
- **Testing**: Pseudo-localization for layout testing
- **Utilities**: @formatjs/cli for message extraction
