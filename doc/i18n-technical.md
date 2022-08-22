# CoinOS Internationalization - Technical Information

_NOTE: This documentation was written for people with a technical background. If you do not have a technical background, consider reading [this guide](./i18n.md) instead._

Last Updated: 2022-08-08

## Dependencies

CoinOS's internationalization system depends on the `npm` package [`svelte-i18n`](https://www.npmjs.com/package/svelte-i18n). Consider reading [its documentation](https://github.com/kaisermann/svelte-i18n/blob/HEAD/docs/Getting%20Started.md) in addition to this.

## Internationalization Code

The main code for CoinOS's internationalization is at `src/lib/i18n.js`. When imported, it does the following:

1. Load all of the locales [asynchronously](https://github.com/kaisermann/svelte-i18n/blob/main/docs/Getting%20Started.md#32-asynchronous).
2. Pick a locale intelligently, depending on the available locales and the navigator locale, using `pickLocale`. Specifically, if the user's locale (e.g. `en-US`) isn't available but its non-regional version (e.g. `en`) is, the system will use the non-regional locale.
3. Initialize `svelte-i18n`.

It also defines important constants, including the list of available locales and the default locale. This code is loaded by importing `$lib/i18n` in `src/routes/__layout.svelte`.

## Locale Files

Each locale in `coinos-ui-v2` is defined by a JSON file in `src/locales`. Its name is the locale's [ISO 639-1 code](https://en.wikipedia.org/wiki/ISO_639-1) plus `.json`. It is simply a file that maps string IDs to translated strings. Here is an example of `en.json`:

```json
{
	"howItWorks": "How It Works",
	"faq": "FAQ",
	"about": "About",
	"startInSeconds": "Start in Seconds",
	"signIn": "Sign In"
}
```

## Internationalizing Strings

Strings are internationalized by simply using `svelte-i18n`'s [`$format`](https://github.com/kaisermann/svelte-i18n/blob/96a5adab7560249c8881e0612454e01c09273400/docs/Formatting.md) function. A localized string looks like this:

```
{$t('stringID')}
```

(`$_` is a convenient alias for `$format`.)

## The Locale Selector

CoinOS also has a `LocaleSelector` component, which should be used to select locales. It is a dropdown that allows you to select & update the locale.

## The Guided Translation Script

CoinOS has a Python script that helps you with the technical parts of translation.  It is located at `src/locales/guided_translation.py`.  It also has some utility functions:
- `nested_dict_keys` - gets a list of keys of a nested dictionary in dot-separated shallow format (e.g. a.b.c)
- `localize_string` - localizes a string interactively
