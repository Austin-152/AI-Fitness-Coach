import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";

import "../globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

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

    return (
        <html lang={locale}>
        <body className={`font-sans antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        </body>
        </html>
    );
}
