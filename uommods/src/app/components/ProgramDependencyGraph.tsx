"use client";

import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
    Profiler,
} from "react";

import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    useEdgesState,
    useNodesState,
    type Edge,
    type Node,
    type NodeMouseHandler,
    type NodeChange,
    type EdgeChange,
} from "reactflow";

import "reactflow/dist/style.css";

import { supabase } from "@/lib/supabase";
import { performanceMonitor } from "@/lib/utils";
import { Course } from "@/lib/types";

/* ---------------- TYPES ---------------- */

type Props = {
    program_id?: string;
    selectedcourseid?: string;
};

type ErrorState = {
    hasError: boolean;
    message: string;
    type: "network" | "not_found" | "malformed_data" | "unknown";
};

type LayoutResult = {
    nodes: Node[];
    edges: Edge[];
};

/* ---------------- CACHE ---------------- */

const layoutCache = new Map<string, LayoutResult>();

/* ---------------- HELPERS ---------------- */

function buildDependencyEdges(
    courses: Course[],
    nodePositions: Record<string, { x: number; y: number }>
): Edge[] {
    const edges: Edge[] = [];

    const normalizeList = (list: string[] | string | null | undefined): string[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (typeof list === "string") {
            return list.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return [];
    };

    courses.forEach((course) => {
        const targetCode = String(course.code).trim();
        const prereqs = normalizeList(course.prerequisites_list);
        const coreqs = normalizeList(course.corequisites_list);

        prereqs.forEach((src) => {
            if (nodePositions[src]) {
                edges.push({
                    id: `pre-${src}-${targetCode}`,
                    source: src,
                    target: targetCode,
                    animated: true,
                    style: { stroke: "#0077cc", strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
        });

        coreqs.forEach((src) => {
            if (nodePositions[src]) {
                edges.push({
                    id: `co-${src}-${targetCode}`,
                    source: src,
                    target: targetCode,
                    animated: true,
                    style: {
                        stroke: "#00aa55",
                        strokeWidth: 2,
                        strokeDasharray: "4 2",
                    },
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
        });
    });

    return edges;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}

const MemoizedReactFlow = React.memo(ReactFlow);

/* ---------------- COMPONENT ---------------- */

export default function CourseFlow({ program_id: initialProgramId = "G400", selectedcourseid }: Props) {
    const [activeProgramId, setActiveProgramId] = useState<string>(initialProgramId);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorState>({
        hasError: false,
        message: "",
        type: "unknown",
    });

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const coursesRef = useRef<Course[]>([]);

    const debouncedSelected = useDebounce(selectedcourseid, 120);

    /* Sync active program if prop changes */
    useEffect(() => {
        if (initialProgramId) {
            setActiveProgramId(initialProgramId);
        }
    }, [initialProgramId]);

    /* ---------------- LAYOUT ---------------- */

    const calculateLayout = useCallback((list: Course[], progId: string): LayoutResult => {
        performanceMonitor.startTiming("layout");

        // Deduplicate courses by code to prevent key collisions
        const uniqueCoursesMap = new Map<string, Course>();
        list.forEach((course) => {
            if (course && course.code) {
                uniqueCoursesMap.set(String(course.code).trim(), course);
            }
        });
        console.table(
            list.map(c => ({
                code: c.code,
                title: c.title,
                level: c.level,
            }))
        );
        const uniqueCourses = Array.from(uniqueCoursesMap.values());

        const key = `${progId}-${uniqueCourses.map((c) => c.code).join(",")}`;
        const cached = layoutCache.get(key);
        if (cached) {
            performanceMonitor.endTiming("layout");
            return cached;
        }

        const levelMap: Record<1 | 2 | 3, Course[]> = { 1: [], 2: [], 3: [] };

        uniqueCourses.forEach((c) => {
            // FIX #2: Parse string level representations safely to numbers
            const parsedLevel = typeof c.level === "string" ? parseInt(c.level, 10) : Number(c.level);
            const level = (parsedLevel >= 1 && parsedLevel <= 3 ? parsedLevel : 1) as 1 | 2 | 3;
            levelMap[level].push(c);
        });

        const spacingX = 190;
        const jitter = 40;
        const yOffset: Record<1 | 2 | 3, number> = { 3: 0, 2: 260, 1: 520 };

        const nodePositions: Record<string, { x: number; y: number }> = {};
        const outNodes: Node[] = [];

        (Object.keys(levelMap) as string[])
            .map((k) => Number(k) as 1 | 2 | 3)
            .forEach((level) => {
                const arr = levelMap[level];
                const offsetX = -((arr.length - 1) * spacingX) / 2;

                arr.forEach((course, i) => {
                    const x = offsetX + i * spacingX;
                    const y = yOffset[level] + (i % 2 === 0 ? -jitter : jitter);
                    const codeStr = String(course.code).trim();

                    nodePositions[codeStr] = { x, y };

                    outNodes.push({
                        id: codeStr,
                        position: { x, y },
                        data: { label: `${codeStr}\n${course.title}` },
                        style: {
                            padding: 10,
                            borderRadius: 8,
                            width: 170,
                            fontSize: 12,
                            whiteSpace: "pre-line",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        },
                    });
                });
            });

        const outEdges = buildDependencyEdges(uniqueCourses, nodePositions);
        const result = { nodes: outNodes, edges: outEdges };

        layoutCache.set(key, result);
        if (layoutCache.size > 8) {
            const first = layoutCache.keys().next().value;
            if (first && typeof first === "string") {
                layoutCache.delete(first);
            }
        }

        performanceMonitor.endTiming("layout");
        return result;
    }, []);

    /* ---------------- DATA LOAD (SUPABASE) ---------------- */

    useEffect(() => {
        let cancelled = false;

        async function load(): Promise<void> {
            setLoading(true);
            setError({ hasError: false, message: "", type: "unknown" });



            setNodes([]);
            setEdges([]);

            try {
                const targetCode = activeProgramId.trim().toUpperCase();
                const tableName = `${targetCode.toUpperCase()}_courses`;

                const { data: tableCourses, error: tableError } = await supabase
                    .from(tableName)
                    .select("*");

                let programCourses = tableCourses ?? [];

                if (tableError || programCourses.length === 0) {
                    const { data: generalCourses, error: generalError } = await supabase
                        .from("courses")
                        .select("*")
                        .contains("program_ids", [targetCode]);

                    if (generalError) {
                        throw new Error(generalError.message);
                    }

                    programCourses = generalCourses ?? [];

                }

                if (cancelled) return;

                if (!programCourses || programCourses.length === 0) {
                    setError({
                        hasError: true,
                        message: `No courses found in Supabase for program "${targetCode}".`,
                        type: "not_found",
                    });
                    setLoading(false);
                    return;
                }

                const fetchedCourses = programCourses as Course[];
                coursesRef.current = fetchedCourses;

                const layout = calculateLayout(fetchedCourses, targetCode);

                setNodes(layout.nodes);
                setEdges(layout.edges);
                setLoading(false);
            } catch (err: unknown) {
                if (cancelled) return;

                setError({
                    hasError: true,
                    message: err instanceof Error ? err.message : "Failed to load courses from Supabase",
                    type: "network",
                });

                setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [activeProgramId, calculateLayout, setNodes, setEdges]);

    /* ---------------- SELECTION ---------------- */

    useEffect(() => {
        const targetCode = debouncedSelected ? debouncedSelected.toUpperCase() : null;
        setSelectedNodeId(targetCode);
    }, [debouncedSelected]);

    /* ---------------- STYLING ---------------- */

    const styledNodes = useMemo<Node[]>(
        () =>
            nodes.map((n) => ({
                ...n,
                style: {
                    ...n.style,
                    border: n.id === selectedNodeId ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    fontWeight: n.id === selectedNodeId ? "bold" : "normal",
                    backgroundColor: n.id === selectedNodeId ? "#eff6ff" : "#ffffff",
                },
            })),
        [nodes, selectedNodeId]
    );

    const styledEdges = useMemo<Edge[]>(
        () =>
            edges.map((e) => {
                const active = e.source === selectedNodeId || e.target === selectedNodeId;

                return {
                    ...e,
                    style: {
                        ...e.style,
                        strokeWidth: active ? 3 : 1.5,
                        stroke: active ? "#2563eb" : "#94a3b8",
                    },
                };
            }),
        [edges, selectedNodeId]
    );

    /* ---------------- HANDLERS ---------------- */

    const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setSelectedNodeId(node.id);
    }, []);

    const handleNodesChange = useCallback((c: NodeChange[]) => onNodesChange(c), [onNodesChange]);

    const handleEdgesChange = useCallback((c: EdgeChange[]) => onEdgesChange(c), [onEdgesChange]);

    /* ---------------- RENDER ---------------- */

    const tabOptions = ["G400", "GG14", "G100", "GN51"];

    return (
        <div className="w-full flex flex-col h-[90vh] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">
                    Program:
                </span>
                {tabOptions.map((code) => {
                    const isActive = activeProgramId.toUpperCase() === code.toUpperCase();
                    return (
                        <button
                            key={code}
                            onClick={() => setActiveProgramId(code)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                isActive
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                        >
                            {code}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-sm font-medium text-slate-500">
                        Loading dependency graph from Supabase…
                    </div>
                )}

                {error.hasError ? (
                    <div className="p-6 text-sm text-red-600 bg-red-50 h-full flex flex-col items-center justify-center text-center">
                        <p className="font-semibold mb-1">Failed to load program graph</p>
                        <p className="text-xs text-red-500 max-w-md">{error.message}</p>
                    </div>
                ) : coursesRef.current.length === 0 && !loading ? (
                    <div className="p-6 text-sm text-slate-500 h-full flex items-center justify-center">
                        No courses found for this program.
                    </div>
                ) : (
                    <Profiler
                        id="CourseFlow"
                        onRender={(id, phase, dur) => {
                            if (process.env.NODE_ENV === "development") {
                                console.log(`${id} ${phase}: ${dur.toFixed(1)}ms`);
                            }
                        }}
                    >
                        {/* FIX #3: Key prop forces re-centering view bounds on program tab change */}
                        <MemoizedReactFlow
                            key={activeProgramId}
                            nodes={styledNodes}
                            edges={styledEdges}
                            onNodesChange={handleNodesChange}
                            onEdgesChange={handleEdgesChange}
                            onNodeClick={onNodeClick}
                            fitView
                            minZoom={0.1}
                            maxZoom={2}
                        >
                            <MiniMap />
                            <Controls />
                            <Background gap={16} />
                        </MemoizedReactFlow>
                    </Profiler>
                )}
            </div>
        </div>
    );
}