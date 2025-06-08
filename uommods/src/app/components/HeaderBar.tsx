"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

export default function HeaderBar() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState("")
    const [academicWeek, setAcademicWeek] = useState("")

    useEffect(() => {
        const date = new Date()
        const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        }
        setCurrentDate(date.toLocaleDateString(undefined, options))

        const termStart = new Date("2025-09-16")
        const weekNum = Math.ceil((+date - +termStart) / (7 * 24 * 60 * 60 * 1000)) + 1
        setAcademicWeek(`Week ${weekNum > 0 ? weekNum : 0}`)
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center space-x-4">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        UoMMods
                    </Link>
                </div>

                {/* Center (desktop nav) */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/course-planner" className="hover:text-blue-600 transition-colors">
                        Course Planner
                    </Link>
                    <Link href="/course-list" className="hover:text-blue-600 transition-colors">
                        Course List
                    </Link>
                </nav>

                {/* Right: Date */}
                <div className="hidden sm:block text-right text-sm text-gray-600">
                    <div>{currentDate}</div>
                    <div className="text-xs text-gray-500">{academicWeek}</div>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {isOpen && (
                <div className="md:hidden px-4 pb-4">
                    <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
                        <Link
                            href="/course-planner"
                            className="hover:text-blue-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Course Planner
                        </Link>
                        <Link
                            href="/course-list"
                            className="hover:text-blue-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Course List
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
