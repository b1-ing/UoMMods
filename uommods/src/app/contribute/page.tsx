"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderBar from "@/app/components/HeaderBar"
// TODO: Replace these with your real links.
const REPO_URL = "https://github.com/b1-ing/uommods";
const ISSUES_URL = `${REPO_URL}/issues`;
const DISCUSS_URL = "https://discord.gg/your-invite"; // or Slack/Telegram
const LOCAL_URL = "http://localhost:3000";

export default function ContributePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
            <HeaderBar />
            {/* Hero */}
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
            <section className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold">Contribute to UoMModules</h1>
                <p className="text-muted-foreground">
                    UoMModules is an open-source, student-built course planner. Whether you code,
                    design, write, or just love good tools—there’s a place for you here.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button asChild>
                        <Link href={REPO_URL} target="_blank" rel="noreferrer">
                            View Repository
                        </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href={ISSUES_URL} target="_blank" rel="noreferrer">
                            Browse Issues
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={DISCUSS_URL} target="_blank" rel="noreferrer">
                            Join the Community
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Quick Start */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>
                            <strong>Fork and clone</strong> the repo:
                            <CodeBlock>
                                git clone {REPO_URL}
                                {"\n"}cd uommodules
                            </CodeBlock>
                        </li>
                        <li>
                            <strong>Install & run</strong> (Node 18+ recommended):
                            <CodeBlock>
                                npm install
                                {"\n"}npm run dev
                            </CodeBlock>
                            <p className="text-sm text-muted-foreground">
                                The app should be available at{" "}
                                <Link href={LOCAL_URL} className="underline">
                                    {LOCAL_URL}
                                </Link>
                                .
                            </p>
                        </li>
                        <li>
                            <strong>Test & lint</strong> before committing:
                            <CodeBlock>
                                npm test
                                {"\n"}npm run lint
                            </CodeBlock>
                        </li>
                    </ol>
                </CardContent>
            </Card>

            {/* Ways to Help */}
            <Card>
                <CardHeader>
                    <CardTitle>Ways to Contribute</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <BulletBlock
                        title="Fix bugs & clean codebase"
                        points={[
                            "Refactor UI, improve performance, clean up codebase.",
                            "Harden accessibility and mobile responsiveness.",
                            "Label issues as \"bug\"."
                        ]}
                        ctaLabel="See Issues"
                        ctaHref={ISSUES_URL}
                    />
                    <BulletBlock
                        title="Data & content"
                        points={[
                            "Work on scraper programs to get course data from school website",
                            "Streamline database structure, refactor main codebase to reflect changes",
                            "Label issues as \"bug\"."
                        ]}
                        ctaLabel="See Issues"
                        ctaHref={ISSUES_URL}
                    />
                    <BulletBlock
                        title="Design & UX"
                        points={[
                            "Propose layout tweaks and interaction improvements.",
                            "Create empty states, error states, and skeletons.",
                            "Suggest component patterns with shadcn/ui.",
                        ]}
                        ctaLabel="Start a Discussion"
                        ctaHref={DISCUSS_URL}
                    />
                    <BulletBlock
                        title="Feature ideation"
                        points={[
                            "Think of new, attractive features to improve user experience/relevance",
                            "Log a Git Issue as \"enhacement\" first, then wait for one of the admins to contact you regarding your plans before you spend time building the feature ",
                        ]}
                        ctaLabel="See Issues"
                        ctaHref={ISSUES_URL}
                    />
                </CardContent>
            </Card>

            {/* Workflow */}
            <Card>
                <CardHeader>
                    <CardTitle>Contribution Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>
                            <strong>Fork</strong> the repository and create a branch:
                            <CodeBlock>
                                git checkout -b feat/your-feature
                            </CodeBlock>
                        </li>
                        <li>
                            <strong>Make changes</strong> with small, clear commits:
                            <CodeBlock>
                                git add .
                                {"\n"}git commit -m &quot;feat(planner): add CSV export to selections&quot;
                            </CodeBlock>
                        </li>
                        <li>
                            <strong>Push & open a PR</strong> with a clear description, screenshots/GIFs
                            (for UI), and a note on testing:
                            <CodeBlock>git push origin feat/your-feature</CodeBlock>
                        </li>
                        <li>
                            <strong>Respond to reviews</strong>, make requested updates, and we’ll merge
                            once checks pass.
                        </li>
                    </ol>
                    <p className="text-sm text-muted-foreground">
                        Tip: Link your PR to its issue using “Fixes #123” to auto-close on merge.
                    </p>
                </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
                <CardHeader>
                    <CardTitle>Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <ul className="space-y-2">
                        <li>✅ Use <em>ESLint</em> & <em>Prettier</em> (run linters before PR).</li>
                        <li>✅ Prefer functional, typed React patterns (TypeScript).</li>
                        <li>✅ Keep components small, accessible, and testable.</li>
                        <li>✅ Write meaningful commit messages and PR descriptions.</li>
                    </ul>
                    <ul className="space-y-2">
                        <li>🔎 Test in multiple viewports & browsers where possible.</li>
                        <li>🧪 Add tests for non-trivial logic or hooks.</li>
                        <li>📚 Document new props, env vars, or scripts you add.</li>
                        <li>🤝 Be respectful and constructive in reviews & discussions.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Community */}
            <Card>
                <CardHeader>
                    <CardTitle>Join the Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p>
                        Questions, ideas, or want to help triage? Join our chat and say hi. We run
                        occasional sprints and are happy to mentor first-time contributors.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href={DISCUSS_URL} target="_blank" rel="noreferrer">
                                Join Chat
                            </Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={REPO_URL} target="_blank" rel="noreferrer">
                                Star the Repo ⭐
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Footer note */}
            <p className="text-center text-sm text-muted-foreground">
                Built with ❤️ by students, for students. Thanks for making UoMModules better.
            </p>
            </div>
        </main>

    );
}

/* ---------- Small presentational helpers ---------- */

function CodeBlock({ children }: { children: React.ReactNode }) {
    return (
        <pre className="mt-2 rounded-xl bg-muted p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
    );
}

function BulletBlock({
                         title,
                         points,
                         ctaLabel,
                         ctaHref,
                     }: {
    title: string;
    points: string[];
    ctaLabel: string;
    ctaHref: string;
}) {
    return (
        <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Button variant="ghost" asChild>
                    <Link href={ctaHref} target="_blank" rel="noreferrer" className="text-sm">
                        {ctaLabel}
                    </Link>
                </Button>
            </div>
            <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
                {points.map((p, i) => (
                    <li key={i} className="text-muted-foreground">
                        {p}
                    </li>
                ))}
            </ul>
        </div>

    );
}
