// CourseFlow.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Edge, Node } from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Course } from "@/lib/mockcourses";

// Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
    program_id: string;
    selectedcourseid: string;

}


type Style = {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

export default function CourseFlow({program_id, selectedcourseid}: Props) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const styledNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      border: node.id === selectedNodeId ? "3px solid #000" : "1px solid #999",
      fontWeight: node.id === selectedNodeId ? "bold" : "normal",
    },
  }));

    // inside CourseFlow component, after your useState declarations:
    useEffect(() => {
        if (selectedcourseid && selectedcourseid !== selectedNodeId) {
            setSelectedNodeId(selectedcourseid);
        }
    }, [selectedcourseid]);


    const styledEdges: Edge[] = edges.map((edge) => {
        const isConnected =
            edge.source === selectedNodeId || edge.target === selectedNodeId;
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



  useEffect(() => {
    const fetchCourses = async () => {
      const { data: courses, error } = await supabase
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

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      // Filter out compulsory modules

      // Assume: data is CourseProgramRecord[] (from Supabase)
      const allCourses: Course[] = [];

      courses.forEach((record) => {
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

      const levelMap: Record<number, Course[]> = {
        1: [] as Course[],
        2: [] as Course[],
        3: [] as Course[],
      };
      filteredCourses.forEach((c: Course) => {
        if (levelMap[c.level]) {
          levelMap[c.level].push(c);
        }
      });

      const spacingX = 100;
      // const spacingY = 250;
      const verticalJitter = 60;

      const levelYOffset: Record<number, number> = {
        3: 0, // Topmost level
        2: 300, // Push level 2 down by 300px
        1: 600, // Push level 1 further down
      };

      const generatedNodes: Node[] = [];
      const nodePositions: Record<string, { x: number; y: number }> = {};
      const edgesList: Edge[] = [];

      [3, 2, 1].forEach((level) => {
        const levelCourses = levelMap[level];
        const offsetX = -((levelCourses.length - 1) * spacingX) / 2;

        levelCourses.forEach((course, j) => {
          const x = offsetX + j * spacingX;
          const y =
            levelYOffset[level] +
            (j % 2 === 0 ? -verticalJitter : verticalJitter);
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
        filteredCourses.forEach((course) => {
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

      setNodes(generatedNodes);
      setEdges(edgesList);
      setLoading(false);
    };

    fetchCourses();
  }, [setNodes, setEdges, setLoading, program_id]);

  if (loading) return <p>Loading course graph...</p>;

  return (
    <div style={{ width: "100%", height: "95vh" }}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
