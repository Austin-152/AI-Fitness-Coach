import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";

import "../globals.css";


export const metadata: Metadata = {
    title: "AI Fitness Coach - 智能健身教练",
    description: "使用 AI 追踪你的营养摄入，获取个性化的健康生活建议",
    icons: {
        icon: [
            {
                url: "/icon-light-32x32.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/icon-dark-32x32.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/icon.svg",
                type: "image/svg+xml",
            },
        ],
        apple: "/apple-icon.png",
    },
};

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html lang={locale}>
        <body className={`font-sans antialiased`}>
        <NextIntlClientProvider>
            <Header user={user ? { email: user.email! } : null} />
            {children}
        </NextIntlClientProvider>
        <Analytics />
        </body>
        </html>
    );
}
