// lib/i18n.ts
import { getRequestConfig } from "next-intl/server";

const defaultLocale = "en";
const locales = ["en", "zh"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const resolvedLocale =
        requested && locales.includes(requested as (typeof locales)[number])
            ? requested
            : defaultLocale;

    return {
        locale: resolvedLocale,
        messages: {
            home: (await import(`../messages/${resolvedLocale}/home.json`)).default,
            nutrition: (await import(`../messages/${resolvedLocale}/nutrition.json`)).default,
            upload: (await import(`../messages/${resolvedLocale}/upload.json`)).default,
            header: (await import(`../messages/${resolvedLocale}/header.json`)).default,
            about:     (await import(`../messages/${resolvedLocale}/about.json`)).default,
            contact:   (await import(`../messages/${resolvedLocale}/contact.json`)).default,
            login:     (await import(`../messages/${resolvedLocale}/login.json`)).default
        }
    };
});
