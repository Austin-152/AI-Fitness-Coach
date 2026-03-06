"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user?: { email: string } | null
  onSignOut?: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const t = useTranslations("header")
  const pathname = usePathname()
  const firstSegment = pathname.split("/")[1]
  const locale = ["en", "zh"].includes(firstSegment) ? firstSegment : "en"
  const loginHref = `/${locale}/auth/login`

  const navItems = [
    { href: `/${locale}`, label: t("nav.home") },
    { href: `/${locale}/about`, label: t("nav.about") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">{t("brand")}</span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-foreground border-b-2 border-primary pb-0.5"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="outline" onClick={onSignOut}>
                {t("signOut")}
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={loginHref}>{t("signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
