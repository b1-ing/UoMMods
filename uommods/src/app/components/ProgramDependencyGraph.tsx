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
import { Course } from "@/lib/types"

/* ---------------- TYPES ---------------- */


type Props = {
    program_id: string;
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

    courses.forEach(course => {
        const prereqs = course.prerequisites_list ?? [];
        const coreqs = course.corequisites_list ?? [];

        prereqs.forEach(src => {
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

        coreqs.forEach(src => {
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

export default function CourseFlow({ program_id, selectedcourseid }: Props) {
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

    /* ---------------- LAYOUT ---------------- */

    const calculateLayout = useCallback((list: Course[]): LayoutResult => {
        performanceMonitor.startTiming("layout");

        const key = `${program_id}-${list.map(c => c.code).join(",")}`;
        const cached = layoutCache.get(key);
        if (cached) {
            performanceMonitor.endTiming("layout");
            return cached;
        }

        const levelMap: Record<1 | 2 | 3, Course[]> = { 1: [], 2: [], 3: [] };
        list.forEach(c => {
            const level = c.level as 1 | 2 | 3;
            levelMap[level].push(c);
        });


        const spacingX = 110;
        const jitter = 60;
        const yOffset: Record<1 | 2 | 3, number> = { 3: 0, 2: 300, 1: 600 };

        const nodePositions: Record<string, { x: number; y: number }> = {};
        const outNodes: Node[] = [];

        (Object.keys(levelMap) as string[])
            .map(k => Number(k) as 1 | 2 | 3)
            .forEach(level => {
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
                        width: 180,
                        whiteSpace: "pre-line",
                        backgroundColor: "#f5f5f5",
                    },
                });
            });
        });

        const outEdges = buildDependencyEdges(list, nodePositions);
        const result = { nodes: outNodes, edges: outEdges };

        layoutCache.set(key, result);
        if (layoutCache.size > 8) {
            const first = layoutCache.keys().next().value;
            if (first) if (typeof first === "string") {
                layoutCache.delete(first);
            }
        }

        performanceMonitor.endTiming("layout");
        return result;
    }, [program_id]);

    /* ---------------- DATA LOAD ---------------- */

    useEffect(() => {
        let cancelled = false;

        async function load(): Promise<void> {
            setLoading(true);
            setError({ hasError: false, message: "", type: "unknown" });

            try {
                const program = programs.find(p => p.program_id === program_id);

                if (!program) {
                    setError({
                        hasError: true,
                        message: "Program not found",
                        type: "not_found",
                    });
                    setLoading(false);
                    return;
                }
                console.log(program.courseCodes)

                const programCourses: Course[] = courses.filter(c =>
                    program.courseCodes.includes(c.code)
                );

                if (cancelled) return;

                coursesRef.current = programCourses;

                const layout = calculateLayout(programCourses);
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
        return () => { cancelled = true; };
    }, [program_id, calculateLayout, setNodes, setEdges]);

    /* ---------------- SELECTION ---------------- */

    useEffect(() => {
        if (debouncedSelected) setSelectedNodeId(debouncedSelected);
    }, [debouncedSelected]);

    /* ---------------- STYLING ---------------- */

    const styledNodes = useMemo<Node[]>(() =>
            nodes.map(n => ({
                ...n,
                style: {
                    ...n.style,
                    border: n.id === selectedNodeId ? "3px solid #000" : "1px solid #999",
                    fontWeight: n.id === selectedNodeId ? "bold" : "normal",
                },
            }))
        , [nodes, selectedNodeId]);

    const styledEdges = useMemo<Edge[]>(() =>
            edges.map(e => {
                const active =
                    e.source === selectedNodeId || e.target === selectedNodeId;

                return {
                    ...e,
                    style: {
                        ...e.style,
                        strokeWidth: active ? 3 : 1,
                        stroke: active ? "#000" : "#999",
                    },
                };
            })
        , [edges, selectedNodeId]);

    /* ---------------- HANDLERS ---------------- */

    const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setSelectedNodeId(node.id);
    }, []);

    const handleNodesChange = useCallback(
        (c: NodeChange[]) => onNodesChange(c),
        [onNodesChange]
    );

    const handleEdgesChange = useCallback(
        (c: EdgeChange[]) => onEdgesChange(c),
        [onEdgesChange]
    );

    /* ---------------- UI STATES ---------------- */

    if (loading) return <div className="p-6">Loading graph…</div>;

    if (error.hasError)
        return <div className="p-6 text-red-600">{error.message}</div>;

    if (coursesRef.current.length === 0)
        return <div className="p-6">No courses found.</div>;

    /* ---------------- RENDER ---------------- */

    return (
        <div style={{ width: "100%", height: "95vh" }}>
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
        </div>
    );
}
