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

type ErrorState = {
    hasError: boolean;
    message: string;
    type: 'network' | 'not_found' | 'malformed_data' | 'unknown';
};

// Safe string parsing helper
const safeParseList = (str: string | null | undefined): string[] => {
    if (!str || typeof str !== 'string') return [];
    return str.split(',')
        .map(item => item?.trim())
        .filter(item => item && item.length > 0);
};

// Memoized node creation function with null safety
const createNode = (
    code: string,
    label: string,
    x: number,
    y: number,
    color: string
) => {
    // Ensure code and label are valid strings
    const safeCode = code?.toString()?.trim() || 'unknown';
    const safeLabel = label?.toString()?.trim() || safeCode;
    
    return {
        id: safeCode,
        position: { x: x || 0, y: y || 0 },
        data: { label: safeLabel },
        style: {
            border: `2px solid ${color || '#6b7280'}`,
            padding: 8,
            borderRadius: 8,
            width: 250,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    };
};

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
    const [error, setError] = useState<ErrorState>({ hasError: false, message: '', type: 'unknown' });

    // Reset error state when courseCode changes
    useEffect(() => {
        setError({ hasError: false, message: '', type: 'unknown' });
    }, [courseCode]);

    // Memoized nodes and edges calculation with error handling
    const { nodes, edges } = useMemo(() => {
        if (!course) return { nodes: [], edges: [] };

        try {
            const titleMap = new Map<string, string>();
            
            // Get from cache or create empty map
            const cacheEntry = courseDataCache.get(courseCode);
            if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
                cacheEntry.relatedCourses?.forEach(c => {
                    if (c && c.code && c.title) {
                        titleMap.set(c.code, c.title);
                    }
                });
            }

            const prerequisites = safeParseList(course.prerequisites_list);
            const corequisites = safeParseList(course.corequisites_list);
            const requiredBy = safeParseList(course.required_by);

            const nodes = [
                createNode(
                    courseCode, 
                    `${courseCode} - ${course.title || 'Unknown Course'}`, 
                    0, 
                    0, 
                    "#2563eb"
                ),

                ...prerequisites.map((pr: string, i: number) =>
                    createNode(
                        pr,
                        `${pr} - ${titleMap.get(pr) || 'Unknown Course'}`,
                        -400,
                        50 * i,
                        "#10b981"
                    )
                ),

                ...corequisites.map((co: string, i: number) =>
                    createNode(
                        co,
                        `${co} - ${titleMap.get(co) || 'Unknown Course'}`,
                        0,
                        50 * (i + 1),
                        "#f59e0b"
                    )
                ),

                ...requiredBy.map((rb: string, i: number) =>
                    createNode(
                        rb,
                        `${rb} - ${titleMap.get(rb) || 'Unknown Course'}`,
                        400,
                        50 * i,
                        "#ef4444"
                    )
                ),
            ];

            const edges = [
                ...prerequisites.map((pr: string) => ({
                    id: `pr-${pr}`,
                    source: pr,
                    target: courseCode,
                    label: "prerequisite of",
                })),
                ...corequisites.map((co: string) => ({
                    id: `co-${co}`,
                    source: courseCode,
                    target: co,
                    label: "corequisite of",
                })),
                ...requiredBy.map((rb: string) => ({
                    id: `rb-${rb}`,
                    source: courseCode,
                    target: rb,
                    label: "required by",
                })),
            ];

            return { nodes, edges };
        } catch (err) {
            console.error("Error generating nodes and edges:", err);
            // Return empty graph on error
            return { nodes: [], edges: [] };
        }
    }, [course, courseCode]);

    // Update nodes and edges when they change
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            setNodesState(nodes);
            setEdgesState(edges);
        }
    }, [nodes, edges, setNodesState, setEdgesState]);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            if (!courseCode?.trim()) {
                setError({
                    hasError: true,
                    message: 'No course code provided',
                    type: 'malformed_data'
                });
                setLoading(false);
                return;
            }

            setLoading(true);
            setError({ hasError: false, message: '', type: 'unknown' });
            
            try {
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

                const { data: course, error: fetchError } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("code", courseCode)
                    .single();

                if (isCancelled) return;

                if (fetchError) {
                    const errorType = fetchError.code === 'PGRST116' ? 'not_found' : 'network';
                    const errorMessage = fetchError.code === 'PGRST116' 
                        ? `Course "${courseCode}" not found` 
                        : `Failed to fetch course data: ${fetchError.message}`;
                    
                    setError({
                        hasError: true,
                        message: errorMessage,
                        type: errorType
                    });
                    setCourse(null);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                    return;
                }

                if (!course) {
                    setError({
                        hasError: true,
                        message: `Course "${courseCode}" not found`,
                        type: 'not_found'
                    });
                    setCourse(null);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                    return;
                }

                // Validate course data structure
                if (typeof course.code !== 'string') {
                    setError({
                        hasError: true,
                        message: 'Course data is malformed',
                        type: 'malformed_data'
                    });
                    setCourse(null);
                    setLoading(false);
                    performanceMonitor.endTiming('course-data-fetch');
                    return;
                }

                const relatedCodes = [
                    ...safeParseList(course.prerequisites_list),
                    ...safeParseList(course.corequisites_list),
                    ...safeParseList(course.required_by),
                ].filter(Boolean);

                let relatedCourses: Array<{ code: string; title: string }> = [];
                
                if (relatedCodes.length > 0) {
                    try {
                        const { data: relatedCoursesData, error: relError } = await supabase
                            .from("courses")
                            .select("code, title")
                            .in("code", relatedCodes);

                        if (!relError && relatedCoursesData) {
                            // Filter out malformed related courses
                            relatedCourses = relatedCoursesData.filter(rc => 
                                rc && typeof rc.code === 'string' && typeof rc.title === 'string'
                            );
                        }
                    } catch (relatedError) {
                        console.warn("Failed to fetch related courses:", relatedError);
                        // Continue without related course titles
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
                    setError({
                        hasError: true,
                        message: error instanceof Error ? error.message : 'An unexpected error occurred',
                        type: 'unknown'
                    });
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

    // Loading state
    if (loading) {
        return (
            <div className="h-[500px] w-full border rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course dependency graph...</p>
                </div>
            </div>
        );
    }

    // Error states
    if (error.hasError) {
        const errorIcon = error.type === 'not_found' ? '🔍' : '❌';
        const retryButton = error.type === 'network' && (
            <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Retry
            </button>
        );

        return (
            <div className="h-[500px] w-full border rounded-lg flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <div className="text-4xl mb-2">{errorIcon}</div>
                    <p className="text-red-600 font-semibold mb-1">Failed to load course graph</p>
                    <p className="text-red-500 text-sm">{error.message}</p>
                    {retryButton}
                </div>
            </div>
        );
    }

    // Empty state (course exists but has no dependencies)
    if (course && nodes.length <= 1) {
        return (
            <div className="h-[500px] w-full border rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-gray-600 font-semibold mb-1">No Dependencies Found</p>
                    <p className="text-gray-500 text-sm">
                        Course {courseCode} has no prerequisites, corequisites, or dependent courses.
                    </p>
                </div>
            </div>
        );
    }

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