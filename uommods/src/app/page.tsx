import HeaderBar from "@/app/components/HeaderBar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, Network, Sparkles } from "lucide-react";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
            <HeaderBar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
                {/* Glow Effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    {/* Top Announcement Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 mb-8 shadow-inner">
                        <Sparkles size={14} className="text-indigo-400" />
                        <span>Built specifically for University of Manchester Students</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                        Plan your university modules with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-300">complete clarity</span>
                    </h1>

                    <p className="text-base sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        UoMMods takes the guesswork out of course selection. Explore workload distributions, chart prerequisite dependencies, and inspect historical cohort trends.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/course-list"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                        >
                            <span>Open Interactive Planner</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            href="/planner"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold transition-all text-sm"
                        >
                            Explore Course Modules
                        </Link>
                    </div>

                    {/* App Window Preview Mockup */}
                    <div className="relative mx-auto max-w-4xl rounded-2xl p-2 bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/80 bg-slate-950/50 rounded-t-xl mb-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="mx-auto text-[11px] font-mono text-slate-500 bg-slate-900 px-3 py-0.5 rounded-md border border-slate-800">
                                uommods.app/planner
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg">
                            <Image
                                src="/planner.png"
                                width={1200}
                                height={800}
                                alt="UoMMods Planner Preview"
                                className="w-full h-auto object-cover rounded-lg"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats Banner */}
            <section className="border-y border-slate-800/80 bg-slate-900/40 py-8">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-2xl font-bold text-white">100%</p>
                        <p className="text-xs text-slate-400 mt-0.5">UoM Curriculum Alignment</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">Visual</p>
                        <p className="text-xs text-slate-400 mt-0.5">Prerequisite Flowcharts</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">Real-time</p>
                        <p className="text-xs text-slate-400 mt-0.5">Credit Target Tracking</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">Cohort</p>
                        <p className="text-xs text-slate-400 mt-0.5">Grade Distributions</p>
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section className="py-20 bg-slate-950 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Designed to solve option-choice headache</h2>
                        <p className="text-sm sm:text-base text-slate-400">
                            Everything you need to select optimal module combinations across Semester 1, Semester 2, and Full-Year units.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            title="Interactive Workload Charts"
                            description="Easily compare lectures, practical labs, independent study hours, and assessment weightings."
                            icon={<BarChart3 size={24} className="text-indigo-400" />}
                        />
                        <FeatureCard
                            title="Grade & Performance Insights"
                            description="View historical grade distributions to understand past cohort dynamics and performance ranges."
                            icon={<GraduationCap size={24} className="text-blue-400" />}
                        />
                        <FeatureCard
                            title="Prerequisite Dependency Maps"
                            description="Map out module prerequisites and future pathways visually before locking in your timetable."
                            icon={<Network size={24} className="text-teal-400" />}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500">
                <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} Brendan Ling. Built for UoM Students.</p>
                    <a
                        href="mailto:brendan.ling@student.manchester.ac.uk"
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        brendan.ling@student.manchester.ac.uk
                    </a>
                </div>
            </footer>
        </main>
    );
}

function FeatureCard({
                         title,
                         description,
                         icon,
                     }: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm">
            <div className="p-3 w-fit rounded-xl bg-slate-800/60 border border-slate-700/50 mb-5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}