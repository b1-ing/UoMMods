"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function HeaderBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState("")
    const [academicWeek, setAcademicWeek] = useState("")

    useEffect(() => {
        const date = new Date()
        const options: Intl.DateTimeFormatOptions = {
            weekday: "short", year: "numeric", month: "short", day: "numeric",
        }
        setCurrentDate(date.toLocaleDateString(undefined, options))

        const termStart = new Date("2025-09-16")
        const weekNum = Math.ceil((+date - +termStart) / (7 * 24 * 60 * 60 * 1000)) + 1
        setAcademicWeek(`Week ${weekNum > 0 ? weekNum : 0}`)
    }, [])

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold text-blue-600">UoMMods</Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
                        <Link href="/course-planner" className="hover:text-blue-600">Course Planner</Link>
                        <Link href="/course-list" className="hover:text-blue-600">Course List</Link>
                    </nav>

                    {/* Date + Week */}
                    <div className="hidden sm:block text-sm text-right text-gray-600">
                        <div>{currentDate}</div>
                        <div className="text-xs text-gray-500">{academicWeek}</div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setSidebarOpen(false)}
            />
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-blue-600">UoMMods</h2>
                    <button onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex flex-col p-4 space-y-4 text-sm font-medium text-gray-700">
                    <Link href="/course-planner" onClick={() => setSidebarOpen(false)}>
                        Course Planner
                    </Link>
                    <Link href="/course-list" onClick={() => setSidebarOpen(false)}>
                        Course List
                    </Link>
                </nav>
            </aside>
        </>
    )
}
