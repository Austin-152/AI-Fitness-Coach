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
            Home: (await import(`../messages/${resolvedLocale}/home.json`)).default
        }
    };
});
