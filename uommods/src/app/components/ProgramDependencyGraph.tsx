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
    Position,
    useEdgesState,
    useNodesState,
    type Edge,
    type Node,
    type NodeMouseHandler,
    type NodeChange,
    type EdgeChange,
} from "reactflow";

import "reactflow/dist/style.css";

import { programs } from "@/lib/programs";
import { courses } from "@/lib/courses";
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

    courses.forEach((course) => {
        const prereqs = course.prerequisites_list ?? [];
        const coreqs = course.corequisites_list ?? [];

        prereqs.forEach((src) => {
            if (nodePositions[src]) {
                edges.push({
                    id: `pre-${src}-${course.code}`,
                    source: src,
                    target: course.code,
                    animated: true,
                    style: { stroke: "#0077cc", strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
        });

        coreqs.forEach((src) => {
            if (nodePositions[src]) {
                edges.push({
                    id: `co-${src}-${course.code}`,
                    source: src,
                    target: course.code,
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

        const key = `${progId}-${list.map((c) => c.code).join(",")}`;
        const cached = layoutCache.get(key);
        if (cached) {
            performanceMonitor.endTiming("layout");
            return cached;
        }

        const levelMap: Record<1 | 2 | 3, Course[]> = { 1: [], 2: [], 3: [] };
        list.forEach((c) => {
            const level = (c.level ?? 1) as 1 | 2 | 3;
            if (levelMap[level]) {
                levelMap[level].push(c);
            }
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

                    nodePositions[course.code] = { x, y };

                    outNodes.push({
                        id: course.code,
                        position: { x, y },
                        data: { label: `${course.code}\n${course.title}` },
                        sourcePosition: Position.Top,
                        targetPosition: Position.Bottom,
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

        const outEdges = buildDependencyEdges(list, nodePositions);
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

    /* ---------------- DATA LOAD ---------------- */

    useEffect(() => {
        let cancelled = false;

        async function load(): Promise<void> {
            setLoading(true);
            setError({ hasError: false, message: "", type: "unknown" });

            try {
                // Case-insensitive program search to prevent "not found" errors
                const targetCode = activeProgramId.trim().toUpperCase();
                const program = programs.find(
                    (p) => p.program_id?.toUpperCase() === targetCode
                );

                if (!program) {
                    setError({
                        hasError: true,
                        message: `Program "${activeProgramId}" not found. Available programs: ${programs
                            .map((p) => p.program_id)
                            .join(", ")}`,
                        type: "not_found",
                    });
                    setLoading(false);
                    return;
                }

                const programCourses: Course[] = courses.filter((c) =>
                    program.courseCodes.includes(c.code)
                );

                if (cancelled) return;

                coursesRef.current = programCourses;

                const layout = calculateLayout(programCourses, targetCode);
                setNodes(layout.nodes);
                setEdges(layout.edges);
                setLoading(false);
            } catch (err: unknown) {
                if (cancelled) return;

                setError({
                    hasError: true,
                    message: err instanceof Error ? err.message : "Unknown error",
                    type: "unknown",
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
        // Standardize to uppercase so URL route params like 'comp10001' match graph nodes like 'COMP10001'
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

    const tabOptions = ["G400", "GG14"];

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
                        Loading dependency graph…
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
                        <MemoizedReactFlow
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