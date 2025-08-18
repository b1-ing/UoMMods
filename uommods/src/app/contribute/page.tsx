"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderBar from "@/app/components/HeaderBar"

const REPO_URL = "https://github.com/b1-ing/uommods";
const ISSUES_URL = `${REPO_URL}/issues`;
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;
const LOCAL_URL = "http://localhost:3000";

export default function ContributePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
            <HeaderBar />
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
                {/* Hero */}
                <section className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold">Contribute to UoMMods</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        UoMMods is an open-source course management system built by University of Manchester 
                        students, for students. Join our community to help improve course planning and 
                        academic optimization for everyone.
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
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
                            <Link href={DISCUSSIONS_URL} target="_blank" rel="noreferrer">
                                Join Discussions
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Prerequisites & Setup */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prerequisites & Development Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">System Requirements</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                    <li><strong>Node.js</strong> v18+ (LTS recommended)</li>
                                    <li><strong>npm</strong> v9+ (comes with Node.js)</li>
                                    <li><strong>Python</strong> v3.8+ (for data scraping)</li>
                                    <li><strong>Git</strong> for version control</li>
                                    <li>Code editor (VS Code recommended)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Technical Knowledge</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                    <li><strong>TypeScript/JavaScript</strong> (React patterns)</li>
                                    <li><strong>Next.js 15</strong> (App Router)</li>
                                    <li><strong>Tailwind CSS</strong> (utility-first styling)</li>
                                    <li><strong>Python</strong> (for scraping scripts)</li>
                                    <li><strong>Git workflows</strong> (branching, PRs)</li>
                                </ul>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold">Setup Instructions</h3>
                        <ol className="list-decimal pl-6 space-y-3">
                            <li>
                                <strong>Clone the repository:</strong>
                                <CodeBlock>
                                    git clone {REPO_URL}
                                    {"\n"}cd uommods
                                </CodeBlock>
                            </li>
                            <li>
                                <strong>Set up Python environment (for scraping scripts):</strong>
                                <CodeBlock>
                                    python -m venv .venv
                                    {"\n"}.venv\Scripts\activate     # Windows
                                    {"\n"}source .venv/bin/activate  # Unix/macOS
                                    {"\n"}pip install -r requirements.txt
                                </CodeBlock>
                            </li>
                            <li>
                                <strong>Set up Next.js application:</strong>
                                <CodeBlock>
                                    cd uommods
                                    {"\n"}npm install
                                </CodeBlock>
                            </li>
                            <li>
                                <strong>Configure environment variables:</strong>
                                <CodeBlock>
                                    cp .env.template .env.local
                                    {"\n"}openssl rand -base64 60  # Generate SESSION_PASSWORD
                                </CodeBlock>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Update <code>.env.local</code> with the generated session password and any other required values.
                                </p>
                            </li>
                            <li>
                                <strong>Start development server:</strong>
                                <CodeBlock>
                                    npm run dev
                                </CodeBlock>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Visit{" "}
                                    <Link href={LOCAL_URL} className="underline text-blue-600">
                                        {LOCAL_URL}
                                    </Link>
                                    {" "}to see the application running locally.
                                </p>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Ways to Contribute */}
                <Card>
                    <CardHeader>
                        <CardTitle>How You Can Contribute</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <ContributionArea
                            title="Frontend Development"
                            icon="💻"
                            points={[
                                "Improve React components with TypeScript",
                                "Enhance UI/UX using Tailwind CSS and Radix UI",
                                "Add interactive features and visualizations",
                                "Optimize performance and accessibility",
                                "Fix bugs and improve code quality"
                            ]}
                            skills="React, TypeScript, Tailwind CSS, Next.js"
                            ctaLabel="Frontend Issues"
                            ctaHref={`${ISSUES_URL}?labels=frontend`}
                        />
                        <ContributionArea
                            title="Data & Backend"
                            icon="🔧"
                            points={[
                                "Improve Python web scraping scripts",
                                "Optimize Supabase database queries",
                                "Add new data sources and processing",
                                "Enhance API endpoints and data sync",
                                "Work on authentication and session management"
                            ]}
                            skills="Python, PostgreSQL, Supabase, Web Scraping"
                            ctaLabel="Backend Issues"
                            ctaHref={`${ISSUES_URL}?labels=backend`}
                        />
                        <ContributionArea
                            title="University Data"
                            icon="📊"
                            points={[
                                "Update course information and prerequisites",
                                "Improve grade distribution accuracy",
                                "Add new academic year data",
                                "Enhance module search and filtering",
                                "Validate scraped data accuracy"
                            ]}
                            skills="Data Analysis, University Systems, Python"
                            ctaLabel="Data Issues"
                            ctaHref={`${ISSUES_URL}?labels=data`}
                        />
                        <ContributionArea
                            title="Documentation & Testing"
                            icon="📝"
                            points={[
                                "Improve developer documentation",
                                "Write user guides and tutorials",
                                "Add unit and integration tests",
                                "Create example workflows",
                                "Document API endpoints"
                            ]}
                            skills="Technical Writing, Testing Frameworks"
                            ctaLabel="Documentation Issues"
                            ctaHref={`${ISSUES_URL}?labels=documentation`}
                        />
                    </CardContent>
                </Card>

                {/* Coding Standards */}
                <Card>
                    <CardHeader>
                        <CardTitle>Coding Standards & Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">TypeScript/React Standards</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>✅ Use <strong>strict TypeScript</strong> - avoid <code>any</code> types</li>
                                    <li>✅ Prefer <strong>functional components</strong> with React hooks</li>
                                    <li>✅ Use <strong>proper prop typing</strong> with interfaces</li>
                                    <li>✅ Follow <strong>React patterns</strong> - useState, useEffect, custom hooks</li>
                                    <li>✅ Keep components <strong>small and focused</strong></li>
                                    <li>✅ Use <strong>Radix UI</strong> components for consistency</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Styling & UI Guidelines</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>✅ Use <strong>Tailwind CSS</strong> utility classes</li>
                                    <li>✅ Follow <strong>mobile-first</strong> responsive design</li>
                                    <li>✅ Ensure <strong>accessibility</strong> (ARIA labels, keyboard nav)</li>
                                    <li>✅ Maintain <strong>consistent spacing</strong> and typography</li>
                                    <li>✅ Test on <strong>multiple screen sizes</strong></li>
                                    <li>✅ Use <strong>semantic HTML</strong> elements</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Python Standards</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>✅ Follow <strong>PEP 8</strong> style guidelines</li>
                                    <li>✅ Use <strong>type hints</strong> for function parameters</li>
                                    <li>✅ Add <strong>docstrings</strong> to functions and classes</li>
                                    <li>✅ Handle <strong>errors gracefully</strong> with try/except</li>
                                    <li>✅ Use <strong>virtual environments</strong> for dependencies</li>
                                    <li>✅ Validate <strong>scraped data</strong> before processing</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Git & Development</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>✅ Use <strong>conventional commits</strong> (feat:, fix:, docs:)</li>
                                    <li>✅ Create <strong>descriptive branch names</strong></li>
                                    <li>✅ Run <strong>linting</strong> before committing</li>
                                    <li>✅ Test <strong>locally</strong> before pushing</li>
                                    <li>✅ Write <strong>clear PR descriptions</strong></li>
                                    <li>✅ Link PRs to <strong>relevant issues</strong></li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Quality Checklist</h4>
                            <p className="text-blue-800 text-sm mb-3">
                                Before submitting your PR, ensure you&apos;ve completed these steps:
                            </p>
                            <div className="grid gap-2 md:grid-cols-2 text-sm">
                                <div>
                                    <div>□ Code builds without errors: <code>npm run build</code></div>
                                    <div>□ Linting passes: <code>npm run lint</code></div>
                                    <div>□ No TypeScript errors in IDE</div>
                                </div>
                                <div>
                                    <div>□ Tested on mobile and desktop</div>
                                    <div>□ Accessible with keyboard navigation</div>
                                    <div>□ No console errors or warnings</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contribution Workflow */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contribution Workflow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ol className="list-decimal pl-6 space-y-4">
                            <li>
                                <div>
                                    <strong>Find or create an issue:</strong>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Browse existing issues or create a new one. For major changes, 
                                        discuss in GitHub Discussions first.
                                    </p>
                                </div>
                            </li>
                            <li>
                                <strong>Fork and create a branch:</strong>
                                <CodeBlock>
                                    git checkout -b feat/course-planner-export
                                    {"\n"}# Use prefixes: feat/, fix/, docs/, refactor/
                                </CodeBlock>
                            </li>
                            <li>
                                <strong>Make changes with clear commits:</strong>
                                <CodeBlock>
                                    git add .
                                    {"\n"}git commit -m &quot;feat(planner): add CSV export functionality&quot;
                                    {"\n"}
                                    {"\n"}# Follow conventional commits format:
                                    {"\n"}# type(scope): description
                                </CodeBlock>
                            </li>
                            <li>
                                <strong>Test your changes:</strong>
                                <CodeBlock>
                                    npm run lint    # Check for linting issues
                                    {"\n"}npm run build   # Ensure build succeeds
                                    {"\n"}# Test manually in browser
                                </CodeBlock>
                            </li>
                            <li>
                                <div>
                                    <strong>Push and open a Pull Request:</strong>
                                    <CodeBlock>git push origin feat/course-planner-export</CodeBlock>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Include screenshots/GIFs for UI changes, describe what you tested, 
                                        and reference the issue with &quot;Fixes #123&quot; to auto-close on merge.
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <strong>Respond to review feedback:</strong>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Address reviewer comments, make requested changes, and be respectful 
                                        in discussions. We&apos;ll merge once all checks pass!
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Security & Privacy */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security & Privacy Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Security Rules</h4>
                            <ul className="space-y-1 text-red-800 text-sm">
                                <li>• <strong>Never commit real student data</strong> - use anonymized test data only</li>
                                <li>• <strong>Don&apos;t expose API keys</strong> - use environment variables</li>
                                <li>• <strong>Handle authentication securely</strong> - follow established patterns</li>
                                <li>• <strong>Validate all user inputs</strong> - prevent injection attacks</li>
                                <li>• <strong>Respect University policies</strong> - follow data usage guidelines</li>
                            </ul>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">Data Privacy</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Use synthetic data for development</li>
                                    <li>• Anonymize any real course data</li>
                                    <li>• Follow GDPR principles</li>
                                    <li>• Document data usage clearly</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Authentication</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Use University of Manchester SSO</li>
                                    <li>• Implement proper session management</li>
                                    <li>• Validate user permissions</li>
                                    <li>• Log security-relevant events</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Community & Support */}
                <Card>
                    <CardHeader>
                        <CardTitle>Community & Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            UoMMods is built by University of Manchester students for the benefit of the 
                            entire student community. We welcome contributors of all skill levels and 
                            backgrounds.
                        </p>
                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">Getting Help</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Check existing documentation first</li>
                                    <li>• Search closed issues for similar problems</li>
                                    <li>• Ask questions in GitHub Discussions</li>
                                    <li>• Tag maintainers for urgent issues</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Code of Conduct</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Be respectful and inclusive</li>
                                    <li>• Provide constructive feedback</li>
                                    <li>• Help newcomers learn</li>
                                    <li>• Follow University community standards</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-4">
                            <Button asChild>
                                <Link href={DISCUSSIONS_URL} target="_blank" rel="noreferrer">
                                    Start a Discussion
                                </Link>
                            </Button>
                            <Button variant="secondary" asChild>
                                <Link href={REPO_URL} target="_blank" rel="noreferrer">
                                    Star the Repository ⭐
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center space-y-4 pt-8">
                    <p className="text-lg font-medium">
                        Ready to contribute to UoMMods?
                    </p>
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                        Whether you&apos;re fixing a small bug, adding a new feature, or improving 
                        documentation, every contribution helps make course planning better for 
                        University of Manchester students.
                    </p>
                    <Button size="lg" asChild>
                        <Link href={ISSUES_URL} target="_blank" rel="noreferrer">
                            View Open Issues
                        </Link>
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground border-t pt-6 mt-8">
                    Built with ❤️ by University of Manchester students, for students. 
                    Thanks for helping make UoMMods better for everyone.
                </p>
            </div>
        </main>
    );
}

/* ---------- Component Helpers ---------- */

function CodeBlock({ children }: { children: React.ReactNode }) {
    return (
        <pre className="mt-2 rounded-lg bg-slate-100 p-4 text-sm overflow-x-auto border">
            <code className="text-slate-800">{children}</code>
        </pre>
    );
}

function ContributionArea({
    title,
    icon,
    points,
    skills,
    ctaLabel,
    ctaHref,
}: {
    title: string;
    icon: string;
    points: string[];
    skills: string;
    ctaLabel: string;
    ctaHref: string;
}) {
    return (
        <div className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <Button size="sm" variant="outline" asChild>
                    <Link href={ctaHref} target="_blank" rel="noreferrer" className="text-xs">
                        {ctaLabel}
                    </Link>
                </Button>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-3">
                {points.map((point, i) => (
                    <li key={i}>{point}</li>
                ))}
            </ul>
            <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                Skills: {skills}
            </div>
        </div>
    );
}