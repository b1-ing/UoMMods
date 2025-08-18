"use client";

import React, { useEffect, useState, useCallback, useMemo, Profiler } from "react";
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Position,
    NodeChange,
    EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "@/lib/supabase";
import {Course} from "@/lib/mockcourses";
import { performanceMonitor } from "@/lib/utils";

type Props = {
    courseCode: string;
};

// Memoized node creation function
const createNode = (
    code: string,
    label: string,
    x: number,
    y: number,
    color: string
) => ({
    id: code,
    position: { x, y },
    data: { label },
    style: {
        border: `2px solid ${color}`,
        padding: 8,
        borderRadius: 8,
        width: 250,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
});

// Cache for course data to avoid repeated fetches
const courseDataCache = new Map<string, {
    course: Course;
    relatedCourses: Array<{ code: string; title: string }>;
    timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const MemoizedReactFlow = React.memo(ReactFlow);

export default function CourseDependencyGraph({ courseCode }: Props) {
    const [course, setCourse] = useState<Course | null>(null);
    const [nodesState, setNodesState, onNodesChange] = useNodesState([]);
    const [edgesState, setEdgesState, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    // Memoized nodes and edges calculation
    const { nodes, edges } = useMemo(() => {
        if (!course) return { nodes: [], edges: [] };

        const titleMap = new Map<string, string>();
        
        // Get from cache or create empty map
        const cacheEntry = courseDataCache.get(courseCode);
        if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
            cacheEntry.relatedCourses.forEach(c => titleMap.set(c.code, c.title));
        }

        const nodes = [
            createNode(courseCode, `${courseCode} - ${course.title ?? ""}`, 0, 0, "#2563eb"),

            ...(course.prerequisites_list?.split(",").map((pr: string, i: number) =>
                createNode(
                    pr.trim(),
                    `${pr.trim()} - ${titleMap.get(pr.trim()) ?? ""}`,
                    -400,
                    50 * i,
                    "#10b981"
                )
            ) ?? []),

            ...(course.corequisites_list?.split(",").map((co: string, i: number) =>
                createNode(
                    co.trim(),
                    `${co.trim()} - ${titleMap.get(co.trim()) ?? ""}`,
                    0,
                    50 * (i + 1),
                    "#f59e0b"
                )
            ) ?? []),

            ...(course.required_by?.split(",").map((rb: string, i: number) =>
                createNode(
                    rb.trim(),
                    `${rb.trim()} - ${titleMap.get(rb.trim()) ?? ""}`,
                    400,
                    50 * i,
                    "#ef4444"
                )
            ) ?? []),
        ];

        const edges = [
            ...(course.prerequisites_list?.split(",").map((pr: string) => ({
                id: `pr-${pr.trim()}`,
                source: pr.trim(),
                target: courseCode,
                label: "prerequisite of",
            })) ?? []),
            ...(course.corequisites_list?.split(",").map((co: string) => ({
                id: `co-${co.trim()}`,
                source: courseCode,
                target: co.trim(),
                label: "corequisite of",
            })) ?? []),
            ...(course.required_by?.split(",").map((rb: string) => ({
                id: `rb-${rb.trim()}`,
                source: courseCode,
                target: rb.trim(),
                label: "required by",
            })) ?? []),
        ];

        return { nodes, edges };
    }, [course, courseCode]);

    // Update nodes and edges when they change
    useEffect(() => {
        setNodesState(nodes);
        setEdgesState(edges);
    }, [nodes, edges, setNodesState, setEdgesState]);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setLoading(true);
            performanceMonitor.startTiming('course-data-fetch');

            // Check cache first
            const cacheEntry = courseDataCache.get(courseCode);
            if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
                if (!isCancelled) {
                    setCourse(cacheEntry.course);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                }
                return;
            }

            try {
                const { data: course, error } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("code", courseCode)
                    .single();

                if (error || !course || isCancelled) {
                    if (!isCancelled) {
                        setCourse(null);
                        setLoading(false);
                    }
                    return;
                }

                const relatedCodes = [
                    ...(course.prerequisites_list?.split(",") ?? []),
                    ...(course.corequisites_list?.split(",") ?? []),
                    ...(course.required_by?.split(",") ?? []),
                ].map(c => c.trim()).filter(Boolean);

                let relatedCourses: Array<{ code: string; title: string }> = [];
                
                if (relatedCodes.length > 0) {
                    const { data: relatedCoursesData, error: relError } = await supabase
                        .from("courses")
                        .select("code, title")
                        .in("code", relatedCodes);

                    if (!relError && relatedCoursesData) {
                        relatedCourses = relatedCoursesData;
                    }
                }

                if (!isCancelled) {
                    // Cache the result
                    courseDataCache.set(courseCode, {
                        course,
                        relatedCourses,
                        timestamp: Date.now()
                    });

                    setCourse(course);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Error fetching course data:", error);
                    setCourse(null);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                }
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, [courseCode]);

    // Optimized change handlers
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        onNodesChange(changes);
    }, [onNodesChange]);

    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        onEdgesChange(changes);
    }, [onEdgesChange]);

    if (loading) return <p>🔄 Loading course data...</p>;
    if (course === null) return <p className="text-red-600">❌ Course not found</p>;

    const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
      }
    };

    return (
        <div className="h-[500px] w-full border rounded-lg">
            <Profiler id="CourseDependencyGraph" onRender={onRenderCallback}>
                <MemoizedReactFlow
                    nodes={nodesState}
                    edges={edgesState}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    fitView
                    maxZoom={2}
                    minZoom={0.5}
                />
            </Profiler>
        </div>
    );
}