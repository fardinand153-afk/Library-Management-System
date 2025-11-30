"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    if (paths.length === 0) return null

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/catalog" className="hover:text-foreground transition-colors">
                <Home className="w-4 h-4" />
            </Link>
            {paths.map((path, index) => {
                let href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1
                const label = path.charAt(0).toUpperCase() + path.slice(1)

                // Custom overrides
                if (path === 'genre') {
                    href = '/browse'
                }

                return (
                    <React.Fragment key={path}>
                        <ChevronRight className="w-4 h-4" />
                        <Link
                            href={href}
                            className={cn(
                                "hover:text-foreground transition-colors",
                                isLast && "text-foreground font-medium pointer-events-none"
                            )}
                        >
                            {label}
                        </Link>
                    </React.Fragment>
                )
            })}
        </nav>
    )
}
