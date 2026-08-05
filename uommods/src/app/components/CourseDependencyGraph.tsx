"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactFlow, { Position, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Course } from "@/lib/types";

type Props = {
    courseCode: string;
};

// Helper to parse potential Postgres array string syntax "{COMP10120,COMP10220}" or CSV into string[]
function parseCourseList(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === "string") {
        return raw
            .replace(/[{}]/g, "")
            .split(",")
            .map((s) => s.trim().replace(/^"|"$/g, ""))
            .filter(Boolean);
    }
    return [];
}

// 1. Helper to create nodes with consistent styling
const createNode = (id: string, label: string, x: number, y: number, color: string): Node => ({
    id,
    position: { x, y },
    data: { label },
    style: {
        border: `2px solid ${color}`,
        padding: "8px",
        borderRadius: "8px",
        width: 220,
        fontSize: "12px",
        backgroundColor: "white",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
});

export default function CourseDependencyGraph({ courseCode }: Props) {
    const [allCoursesMap, setAllCoursesMap] = useState<Map<string, Course>>(new Map());
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchGraphData() {
            if (!courseCode) return;
            try {
                setLoading(true);

                // 1. Fetch target course
                const { data: targetData, error: targetError } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("code", courseCode)
                    .maybeSingle();

                if (targetError) throw targetError;
                if (!targetData) {
                    setCurrentCourse(null);
                    return;
                }

                setCurrentCourse(targetData as Course);

                // Extract all related codes to fetch titles in bulk
                const prereqs = parseCourseList(targetData.prerequisites_list);
                const coreqs = parseCourseList(targetData.corequisites_list);
                const requiredBy = parseCourseList(targetData.required_by);
                const relatedCodes = Array.from(new Set([...prereqs, ...coreqs, ...requiredBy, courseCode]));
                console.log(prereqs)
                // 2. Fetch details for target course + all related courses
                const { data: relatedCoursesData, error: relatedError } = await supabase
                    .from("courses")
                    .select("*")
                    .in("code", relatedCodes);

                if (relatedError) throw relatedError;

                // Build a map for instant course lookup
                const cMap = new Map<string, Course>();
                (relatedCoursesData as Course[] || []).forEach((c) => {
                    if (c.code) cMap.set(c.code.toUpperCase(), c);
                });

                setAllCoursesMap(cMap);
            } catch (err) {
                console.error("Failed to load dependency graph from Supabase:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchGraphData();
    }, [courseCode]);

    const { nodes, edges } = useMemo(() => {
        if (!currentCourse) return { nodes: [], edges: [] };

        const getTitle = (code: string) => {
            const match = allCoursesMap.get(code.toUpperCase());
            return match ? `${code} - ${match.title}` : code;
        };

        const nodeMap = new Map<string, Node>();
        const tempEdges: Edge[] = [];

        // Central Node
        nodeMap.set(courseCode, createNode(courseCode, getTitle(courseCode), 0, 0, "#2563eb"));

        const prereqs = parseCourseList(currentCourse.prerequisites_list);
        const coreqs = parseCourseList(currentCourse.corequisites_list);
        const requiredBy = parseCourseList(currentCourse.required_by);

        // Process Prerequisites (Left side)
        prereqs.forEach((prereq, i) => {
            if (!nodeMap.has(prereq)) {
                nodeMap.set(prereq, createNode(prereq, getTitle(prereq), -300, i * 60, "#10b981"));
            }
            tempEdges.push({
                id: `e-pr-${prereq}-${courseCode}`,
                source: prereq,
                target: courseCode,
                label: "prerequisite",
                animated: true,
            });
        });

        // Process Corequisites (Bottom side)
        coreqs.forEach((coreq, i) => {
            if (!nodeMap.has(coreq)) {
                nodeMap.set(coreq, createNode(coreq, getTitle(coreq), 0, (i + 1) * 80, "#f59e0b"));
            }
            tempEdges.push({
                id: `e-co-${courseCode}-${coreq}`,
                source: courseCode,
                target: coreq,
                label: "corequisite",
            });
        });

        // Process Required By (Right side)
        requiredBy.forEach((reqBy, i) => {
            if (!nodeMap.has(reqBy)) {
                nodeMap.set(reqBy, createNode(reqBy, getTitle(reqBy), 300, i * 60, "#8b5cf6"));
            }

            tempEdges.push({
                id: `e-rb-${courseCode}-${reqBy}`,
                source: courseCode,
                target: reqBy,
                label: "required by",
                style: { strokeDasharray: "4 2" },
            });
        });

        return {
            nodes: Array.from(nodeMap.values()),
            edges: tempEdges,
        };
    }, [courseCode, currentCourse, allCoursesMap]);

    if (loading) {
        return (
            <div className="h-[300px] w-full border rounded-xl flex flex-col items-center justify-center bg-slate-50 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading dependency graph...</p>
            </div>
        );
    }

    if (nodes.length <= 1) {
        return (
            <div className="h-[300px] w-full border rounded-lg flex items-center justify-center bg-slate-50 text-muted-foreground">
                <p className="text-sm">No prerequisites or corequisites listed for this course.</p>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full border rounded-xl bg-white shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodesDraggable={true}
                nodesConnectable={false}
                fitView
                preventScrolling={false}
            />
        </div>
    );
}