"use client";

import Link from "next/link";
import { Menu, X, User, LogOut, Settings, LogIn, AppWindow } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import GithubStarButton from "./GithubStarButton";

export default function HeaderBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [academicWeek, setAcademicWeek] = useState("");
  const [redirectPath, setRedirectPath] = useState("/");
  const [user, setUser] = useState<{ fullname: string; username: string } | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Set initial redirect path on client mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const date = new Date();

      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      setCurrentDate(date.toLocaleDateString(undefined, dateOptions));
      setCurrentTime(date.toLocaleTimeString(undefined, timeOptions));

      // Term Start Calculation
      const termStart = new Date("2025-09-22");
      const weekNum = Math.ceil((+date - +termStart) / (7 * 24 * 60 * 60 * 1000));

      if (weekNum <= 0) {
        setAcademicWeek("Summer Break");
      } else if (weekNum <= 12) {
        setAcademicWeek(`Semester 1 Week ${weekNum}`);
      } else if (weekNum <= 16) {
        setAcademicWeek(`Winter Break Week ${weekNum - 12}`);
      } else if (weekNum <= 19) {
        setAcademicWeek(`Semester 1 Exam Week ${weekNum - 16}`);
      } else if (weekNum <= 31) {
        setAcademicWeek(`Semester 2 Week ${weekNum - 19}`);
      } else if (weekNum <= 34) {
        setAcademicWeek(`Easter Break Week ${weekNum - 31}`);
      } else if (weekNum <= 38) {
        setAcademicWeek(`Semester 2 Exam Week ${weekNum - 34}`);
      } else {
        setAcademicWeek(`Summer Break`);
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/session", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.auth) {
            setUser({
              fullname: data.user.fullname,
              username: data.user.username,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    fetchSession();
  }, []);

  const decodedName = useMemo(() => {
    return user ? decodeURIComponent(user.fullname) : "";
  }, [user]);

  const initials = useMemo(() => {
    if (!decodedName) return "";
    return decodedName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
  }, [decodedName]);

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return (
      <>
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-xs">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link
                href="/"
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 hover:opacity-90 transition-opacity"
            >
              UoMMods
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm text-slate-300 font-medium">
              <Link href="/plannerv2" className="hover:text-indigo-400 transition-colors">
                Course Planner
              </Link>
              <Link href="/course-list" className="hover:text-indigo-400 transition-colors">
                Course List
              </Link>
              <Link
                  href="/contribute"
                  className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <AppWindow size={16} />
                <span>Contribute</span>
              </Link>
            </nav>

            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right text-xs">
                <div className="text-slate-300 font-mono">
                  {currentDate} {currentTime}
                </div>
                <div className="text-indigo-400 font-medium">{academicWeek}</div>
              </div>

              {/* Profile Menu Dropdown */}
              <div className="relative">
                <button
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border border-indigo-400/30">
                          {initials}
                        </div>
                        <span className="max-w-[120px] truncate">{decodedName}</span>
                      </>
                  ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                        <User size={16} />
                        <span>Log in</span>
                      </div>
                  )}
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-slate-300">
                      {user ? (
                          <>
                            <Link
                                href="/settings"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-400" />
                              <span>Settings</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800/80 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </>
                      ) : (
                          <Link
                              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <LogIn className="w-4 h-4 text-slate-400" />
                            <span>Login</span>
                          </Link>
                      )}
                    </div>
                )}
              </div>

              <GithubStarButton />
            </div>

            {/* Mobile Menu Trigger */}
            <button
                className="md:hidden text-slate-300 hover:text-white p-1"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <div
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
            onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar */}
        <aside
            className={`fixed top-0 right-0 z-50 h-full w-72 bg-slate-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <span className="text-lg font-bold text-indigo-400">UoMMods</span>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Academic Clock Banner in Drawer */}
              <div className="px-4 py-3 border-b border-slate-900 bg-slate-900/40 text-xs">
                <div className="text-slate-300 font-mono">
                  {currentDate} {currentTime}
                </div>
                <div className="text-indigo-400 font-medium mt-0.5">{academicWeek}</div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col p-4 space-y-3 text-sm font-medium text-slate-300">
                <Link
                    href="/plannerv2"
                    onClick={() => setSidebarOpen(false)}
                    className="py-1.5 hover:text-indigo-400 transition-colors"
                >
                  Course Planner
                </Link>
                <Link
                    href="/course-list"
                    onClick={() => setSidebarOpen(false)}
                    className="py-1.5 hover:text-indigo-400 transition-colors"
                >
                  Course List
                </Link>
                <Link
                    href="/contribute"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 py-1.5 hover:text-indigo-400 transition-colors"
                >
                  <AppWindow size={16} />
                  <span>Contribute</span>
                </Link>
              </nav>
            </div>

            {/* User Profile & GitHub CTA Section */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
              <GithubStarButton />

              {user ? (
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="text-sm text-slate-200 font-semibold truncate mb-2">
                      {decodedName}
                    </div>
                    <Link
                        href="/settings"
                        onClick={() => setSidebarOpen(false)}
                        className="block py-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                        onClick={logout}
                        className="block py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
              ) : (
                  <Link
                      href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    <LogIn size={14} />
                    <span>Log in</span>
                  </Link>
              )}
            </div>
          </div>
        </aside>
      </>
  );
}