# hashme Internationalization - Technical Information

_NOTE: This documentation was written for people with a technical background. If you do not have a technical background, consider reading [this guide](./i18n.md) instead._

Last Updated: 2022-08-23

## Dependencies

hashme's internationalization system depends on the `npm` package [`sveltekit-i18n`](https://www.npmjs.com/package/sveltekit-i18n). Consider reading [its documentation](https://github.com/sveltekit-i18n/lib/tree/master/docs/README.md) in addition to this.

## Internationalization Code

The main code for hashme's internationalization is at `src/lib/translations/index.js`. When imported, it does the following:

1. Load all of the locales asynchronously, based on .
2. Initialize `sveltekit-i18n`.

It also defines important constants, including the list of available locales and the default locale. This code is loaded by importing `$lib/translations` in `src/routes/+layout.svelte`. This code, which runs in the frontend, also persists the locale in `localStorage`.

## Locale Files

Each locale in `hashme-ui-v2` is defined by a JSON file in `src/locales`. Its name is the locale's [ISO 639-1 code](https://en.wikipedia.org/wiki/ISO_639-1) plus `.json`. It is simply a file that maps string IDs to translated strings. Here is an example of `en.json`:

```json
{
	"howItWorks": "How it works",
	"faq": "FAQ",
	"about": "About",
	"startInSeconds": "Start in Seconds",
	"signIn": "Sign In"
}
```

## Internationalizing Strings

Strings are internationalized by simply using `sveltekit-i18n`'s `$t` function. A localized string looks like this:

```
{$t('stringID')}
```

## The Locale Selector

hashme also has a `LocaleSelector` component, which should be used to select locales. It is a dropdown that allows you to select & update the locale.

## The Guided Translation Script

hashme has a Python script that helps you with the technical parts of translation. It is located at `src/locales/guided_translation.py`. It also has some utility functions:

- `nested_dict_keys` - gets a list of keys of a nested dictionary in dot-separated shallow format (e.g. a.b.c)
- `create_locale` - adds a new locale to the lang.json file
- `localize_string` - localizes a string interactively
