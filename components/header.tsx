"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user?: { email: string } | null
  onSignOut?: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">AI Fitness Coach</span>
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
                Sign Out
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
