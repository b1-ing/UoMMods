// CourseFlow.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef, Profiler } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Edge, Node, NodeMouseHandler } from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { Course } from "@/lib/mockcourses";
import { performanceMonitor } from "@/lib/utils";

// Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
    program_id: string;
    selectedcourseid?: string;
}

type ErrorState = {
    hasError: boolean;
    message: string;
    type: 'network' | 'not_found' | 'malformed_data' | 'unknown';
};

// Layout cache for expensive calculations
const layoutCache = new Map<string, { nodes: Node[], edges: Edge[] }>();

// Debounce utility for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Virtual viewport for large graphs
function useVirtualViewport(
  nodes: Node[],
  edges: Edge[],
  viewportBounds: { x: number; y: number; width: number; height: number }
) {
  return useMemo(() => {
    const BUFFER = 200; // Buffer around viewport
    const visibleNodes = nodes.filter((node) => {
      return (
        node.position.x >= viewportBounds.x - BUFFER &&
        node.position.x <= viewportBounds.x + viewportBounds.width + BUFFER &&
        node.position.y >= viewportBounds.y - BUFFER &&
        node.position.y <= viewportBounds.y + viewportBounds.height + BUFFER
      );
    });

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = edges.filter((edge) => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return { nodes: visibleNodes, edges: visibleEdges };
  }, [nodes, edges, viewportBounds.x, viewportBounds.y, viewportBounds.width, viewportBounds.height]);
}

type Style = {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

const MemoizedReactFlow = React.memo(ReactFlow);

export default function CourseFlow({program_id, selectedcourseid}: Props) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorState>({ hasError: false, message: '', type: 'unknown' });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [viewportBounds] = useState({ x: 0, y: 0, width: 1000, height: 800 });
    
    const debouncedSelectedCourseId = useDebounce(selectedcourseid, 100);
    const coursesDataRef = useRef<Course[]>([]);
    
    // Virtual viewport for performance
    const { nodes: virtualNodes, edges: virtualEdges } = useVirtualViewport(nodes, edges, viewportBounds);

    // Reset error state when program_id changes
    useEffect(() => {
        setError({ hasError: false, message: '', type: 'unknown' });
    }, [program_id]);

    // Memoized styled nodes to prevent unnecessary recalculations
    const styledNodes = useMemo(() => {
      return virtualNodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          border: node.id === selectedNodeId ? "3px solid #000" : "1px solid #999",
          fontWeight: node.id === selectedNodeId ? "bold" : "normal",
        },
      }));
    }, [virtualNodes, selectedNodeId]);

    // Memoized styled edges
    const styledEdges: Edge[] = useMemo(() => {
      return virtualEdges.map((edge) => {
        const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;
        return {
          ...edge,
          style: {
            ...edge.style,
            strokeWidth: isConnected ? 3 : 1,
            stroke: isConnected ? '#000' : '#999',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isConnected ? '#000' : '#999',
          },
        };
      });
    }, [virtualEdges, selectedNodeId]);

    // Debounced effect for selected course changes
    useEffect(() => {
        if (debouncedSelectedCourseId && debouncedSelectedCourseId !== selectedNodeId) {
            setSelectedNodeId(debouncedSelectedCourseId);
        }
    }, [debouncedSelectedCourseId, selectedNodeId]);

    // Memoized layout calculation
    const calculateLayout = useCallback((courses: Course[]) => {
      performanceMonitor.startTiming('layout-calculation');
      
      const cacheKey = `${program_id}-${courses.length}-${courses.map(c => c.code).join(',')}`;
      
      // Check cache first
      if (layoutCache.has(cacheKey)) {
        performanceMonitor.endTiming('layout-calculation');
        return layoutCache.get(cacheKey)!;
      }

      const levelMap: Record<number, Course[]> = {
        1: [] as Course[],
        2: [] as Course[],
        3: [] as Course[],
      };
      
      courses.forEach((c: Course) => {
        if (levelMap[c.level]) {
          levelMap[c.level].push(c);
        }
      });

      const spacingX = 100;
      const verticalJitter = 60;

      const levelYOffset: Record<number, number> = {
        3: 0,
        2: 300,
        1: 600,
      };

      const generatedNodes: Node[] = [];
      const nodePositions: Record<string, { x: number; y: number }> = {};
      const edgesList: Edge[] = [];

      [3, 2, 1].forEach((level) => {
        const levelCourses = levelMap[level];
        const offsetX = -((levelCourses.length - 1) * spacingX) / 2;

        levelCourses.forEach((course, j) => {
          const x = offsetX + j * spacingX;
          const y = levelYOffset[level] + (j % 2 === 0 ? -verticalJitter : verticalJitter);
          const id = course.code;

          nodePositions[id] = { x, y };

          generatedNodes.push({
            id,
            type: "default",
            position: { x, y },
            data: { label: `${id}\n${course.title}` },
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
            style: {
              padding: 10,
              border: "1px solid #555",
              borderRadius: 8,
              width: 180,
              whiteSpace: "pre-line",
              backgroundColor: "#f5f5f5",
            },
          });
        });
      });

      // Add prerequisite and corequisite edges
      const addEdges = (
        type: "prerequisites_list" | "corequisites_list",
        style: Style
      ) => {
        courses.forEach((course) => {
          const deps = course[type];
          if (deps) {
            const related = deps.split(",").map((c: string) => c.trim());
            related.forEach((target: string) => {
              if (nodePositions[target]) {
                edgesList.push({
                  id: `e-${type}-${target}-${course.code}`,
                  source: target,
                  target: course.code,
                  animated: true,
                  style,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: style.stroke,
                  },
                });
              }
            });
          }
        });
      };

      addEdges("prerequisites_list", { stroke: "#0077cc", strokeWidth: 2 });
      addEdges("corequisites_list", {
        stroke: "#00aa55",
        strokeWidth: 2,
        strokeDasharray: "4 2",
      });

      const result = { nodes: generatedNodes, edges: edgesList };
      
      // Cache the result
      layoutCache.set(cacheKey, result);
      
      // Limit cache size
      if (layoutCache.size > 10) {
        const firstKey = layoutCache.keys().next().value;
        if (firstKey) {
          layoutCache.delete(firstKey);
        }
      }
      
      performanceMonitor.endTiming('layout-calculation');
      return result;
    }, [program_id]);

    useEffect(() => {
      let isCancelled = false;
      
      const fetchCourses = async () => {
        if (!program_id?.trim()) {
          setError({
            hasError: true,
            message: 'No program ID provided',
            type: 'malformed_data'
          });
          setLoading(false);
          return;
        }

        setLoading(true);
        setError({ hasError: false, message: '', type: 'unknown' });

        try {
          performanceMonitor.startTiming('program-courses-fetch');
          const { data: courses, error: fetchError } = await supabase
            .from("course_programs")
            .select(
              `
        course_code,
        courses (
        *
        )
      `
            )
            .eq("program_id", program_id);
          performanceMonitor.endTiming('program-courses-fetch');

          if (isCancelled) return;

          if (fetchError) {
            console.error("Error fetching courses:", fetchError);
            const errorType = fetchError.code === 'PGRST116' ? 'not_found' : 'network';
            const errorMessage = fetchError.code === 'PGRST116' 
              ? `Program "${program_id}" not found`
              : `Failed to fetch program data: ${fetchError.message}`;
            
            setError({
              hasError: true,
              message: errorMessage,
              type: errorType
            });
            setLoading(false);
            return;
          }

          if (!courses || courses.length === 0) {
            setError({
              hasError: true,
              message: `No courses found for program "${program_id}"`,
              type: 'not_found'
            });
            setLoading(false);
            return;
          }

          // Process courses
          const allCourses: Course[] = [];
          courses?.forEach((record) => {
            const courseOrCourses = record.courses as Course | Course[];

            if (Array.isArray(courseOrCourses)) {
              allCourses.push(...courseOrCourses);
            } else if (courseOrCourses && courseOrCourses.code) {
              allCourses.push(courseOrCourses);
            }
          });

          const filteredCourses = allCourses.filter(
            (c): c is Course => !!c && !!c.code
          );

          if (filteredCourses.length === 0) {
            setError({
              hasError: true,
              message: `No valid courses found for program "${program_id}"`,
              type: 'not_found'
            });
            setLoading(false);
            return;
          }

          if (isCancelled) return;

          // Store courses data for reference
          coursesDataRef.current = filteredCourses;

          // Calculate layout with memoization
          const { nodes: generatedNodes, edges: edgesList } = calculateLayout(filteredCourses);

          setNodes(generatedNodes);
          setEdges(edgesList);
          setLoading(false);
        } catch (error) {
          if (!isCancelled) {
            console.error("Error in fetchCourses:", error);
            setError({
              hasError: true,
              message: error instanceof Error ? error.message : 'An unexpected error occurred',
              type: 'unknown'
            });
            setLoading(false);
          }
        }
      };

      fetchCourses();

      return () => {
        isCancelled = true;
      };
    }, [program_id, calculateLayout, setNodes, setEdges]);

    // Optimized change handlers
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
      onNodesChange(changes);
    }, [onNodesChange]);

    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
      onEdgesChange(changes);
    }, [onEdgesChange]);

    const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
      setSelectedNodeId(node.id);
    }, []);

    // Loading state
    if (loading) {
      return (
        <div style={{ width: "100%", height: "95vh" }} className="flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading program dependency graph...</p>
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
        <div style={{ width: "100%", height: "95vh" }} className="flex items-center justify-center bg-red-50">
          <div className="text-center">
            <div className="text-4xl mb-2">{errorIcon}</div>
            <p className="text-red-600 font-semibold mb-1">Failed to load program graph</p>
            <p className="text-red-500 text-sm">{error.message}</p>
            {retryButton}
          </div>
        </div>
      );
    }

    // Empty state (program exists but has no courses)
    if (coursesDataRef.current.length === 0) {
      return (
        <div style={{ width: "100%", height: "95vh" }} className="flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600 font-semibold mb-1">No Courses Found</p>
            <p className="text-gray-500 text-sm">
              Program {program_id} has no courses to display.
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
      <div style={{ width: "100%", height: "95vh" }}>
        <Profiler id="ProgramDependencyGraph" onRender={onRenderCallback}>
          <MemoizedReactFlow
            nodes={styledNodes}
            edges={styledEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            maxZoom={2}
            minZoom={0.1}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </MemoizedReactFlow>
        </Profiler>
      </div>
    );
}