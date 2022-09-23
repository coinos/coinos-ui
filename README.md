# coinos-ui-v2

coinos is an easy to use bitcoin point of sale application for businesses and wallet for customers, connecting the bitcoin circular economy together.

This repository is the latest front-end code for the coinos web application.

## Commands

To get started, clone or download the repo, then:

- run `pnpm install` inside the repo once to install all dependencies (and whenever you pull new commits)
- run `pnpm run dev` every time you want to start up the UI
- run `pnpm format` to format the code before committing any changes

This is a frontend for [`coinos-server`](https://github.com/coinos/coinos-server), so you will need to have that running in order for this UI to be useful.

## Libraries

This UI uses the following libraries:

- [`sveltekit`](https://kit.svelte.dev/) as the JavaScript framework
- [`tailwindcss`](https://tailwindcss.com/) for inline styling
- [`pnpm`](https://pnpm.io/) as the recommended package manager
- [`prettier`](https://prettier.io/) as the code formatting standard and tool

## Extra Features

### Internationalization

coinos has a system for translation using [`sveltekit-i18n`](https://www.npmjs.com/package/sveltekit-i18n). For more information and instructions on how to translate coinos, click [here](./doc/i18n.md). For technical details, click [here](./doc/i18n-technical.md).

