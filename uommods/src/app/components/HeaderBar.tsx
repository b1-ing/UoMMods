"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


export default function HeaderBar() {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <span className="hidden font-bold sm:inline-block">UoMMods</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/course-planner" className="transition-colors hover:text-foreground/80">
                            Course Planner
                        </Link>
                        <Link href="/course-list" className="transition-colors hover:text-foreground/80">
                            Course List
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
