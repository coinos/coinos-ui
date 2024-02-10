
export const handle = (async ({ event, resolve }) => {
	let theme = "dark";

	const newTheme = event.url.searchParams.get("theme");
	const cookieTheme = event.cookies.get("colortheme");

	if (newTheme) {
		theme = newTheme;
	} else if (cookieTheme) {
		theme = cookieTheme;
	}

	if (theme) {
		return await resolve(event, {
			transformPageChunk: ({ html }) => {
                const modifiedHtml = html.replace(/<html[^>]*>/, (match) => {
                    // Ensure the class attribute exists or add it if missing
                    return match.includes('class="')
                        ? match.replace(/class="[^"]*"/, `class="${theme}"`)
                        : match.replace('>', ` class="${theme}">`);
                });
                return modifiedHtml;
            }
		});
	}

	return await resolve(event);
})