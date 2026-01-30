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
  const [user, setUser] = useState<
    { fullname: string; username: string } | undefined
  >(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      const termStart = new Date("2025-09-22");
      const weekNum =
        Math.ceil((+date - +termStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
      console.log(typeof weekNum)
        if (weekNum <=13){
          console.log(weekNum <=13)
          setAcademicWeek(`Semester 1 Week ${weekNum}`);
        }
        else if (weekNum<=14 && weekNum<=17){
          setAcademicWeek(`Winter Break Week ${weekNum-14}`);
        }
        else if (weekNum<=18 && weekNum <=20){
          setAcademicWeek(`Semester 1 Exam Week ${weekNum-18}`);
        }
        else if (weekNum <=21 && weekNum <=28){
          setAcademicWeek(`Semester 2 Week ${weekNum-21}`);
        }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/session", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.auth) {
            console.log(data);
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
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-black-600 hover:text-blue-600"
          >
            UoMMods
          </Link>

          <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
            <Link href="/course-planner" className="hover:text-blue-600">
              Course Planner
            </Link>
            <Link href="/course-list" className="hover:text-blue-600">
              Course List
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
              <AppWindow  size={18} />
              <Link href="/contribute" >
                Contribute
              </Link>
            </div>
          </nav>

          <div className="hidden sm:flex items-center gap-6">
            <div className="text-sm text-right text-gray-600">
              <div>
                {currentDate} {currentTime}
              </div>
              <div className="text-xs text-gray-500">{academicWeek}</div>
            </div>

            {/* Profile section (desktop) */}
            <div className="relative">
              <button
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <span>{decodedName}</span>
                  </>
                ) : (
                  <>
                    <User size={18} />
                    <span>Log in</span>
                  </>
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                  {user ? (
                    <>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Settings className="inline-block w-4 h-4 mr-2" />{" "}
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LogOut className="inline-block w-4 h-4 mr-2" /> Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(
                        window.location.pathname
                      )}`}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <LogIn className="inline-block w-4 h-4 mr-2" /> Login
                    </Link>
                  )}
                </div>
              )}
            </div>
            <GithubStarButton />

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

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="relative h-full">
            {/* Time section (top) */}
            <div className="px-4 py-3 border-b text-sm text-gray-700">
              <div>
                {currentDate} {currentTime}
              </div>
              <div className="text-xs text-gray-500">{academicWeek}</div>
            </div>

            {/* Nav links */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-blue-600">UoMMods</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col p-4 space-y-4 text-sm font-medium text-gray-700">
              <Link
                href="/course-planner"
                onClick={() => setSidebarOpen(false)}
              >
                Course Planner
              </Link>
              <Link href="/course-list" onClick={() => setSidebarOpen(false)}>
                Course List
              </Link>
              <div className="absolute bottom-2">
                <GithubStarButton />
              </div>
            </nav>
          </div>

          {/* Profile section (bottom) */}
          <div className="p-4 border-t text-sm">
            {user ? (
              <div>
                <div className="mb-2 text-gray-700 font-semibold">
                  {decodedName}
                </div>
                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="block py-1 hover:text-blue-600"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block py-1 text-left text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setSidebarOpen(false)}
                className="text-blue-600 hover:underline"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
