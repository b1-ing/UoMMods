"use client";

import React, { useMemo } from "react";
import ReactFlow, { Position, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { courses } from "@/lib/courses";


type Props = {
    courseCode: string;
};

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
    const { nodes, edges } = useMemo(() => {
        const currentCourse = courses.find(c => c.code?.toUpperCase() === courseCode);
        if (!currentCourse) return { nodes: [], edges: [] };

        const getTitle = (code: string) => {
            const match = courses.find(c => c.code === code);

            return match ? `${code} - ${match.title}` : code;
        };



        // Use a Map to ensure unique IDs (Keys are strings, Values are Node objects)
        const nodeMap = new Map<string, Node>();
        const tempEdges: Edge[] = [];

        // 2. Central Node
        nodeMap.set(courseCode, createNode(courseCode, getTitle(courseCode), 0, 0, "#2563eb"));

        // 3. Process Prerequisites
        currentCourse.prerequisites_list?.forEach((prereq, i) => {
            console.log(prereq);
            // Only add node if it doesn't already exist
            if (!nodeMap.has(prereq)) {
                nodeMap.set(prereq, createNode(prereq, getTitle(prereq), -300, i * 60, "#10b981"));

            }
            tempEdges.push({
                id: `e-pr-${prereq}-${courseCode}`, // Unique edge ID
                source: prereq,
                target: courseCode,
                label: "prerequisite",
                animated: true,
            });
        });

        // 4. Process Corequisites
        currentCourse.corequisites_list?.forEach((coreq, i) => {
            if (!nodeMap.has(coreq)) {
                nodeMap.set(coreq, createNode(coreq, getTitle(coreq), 0, (i + 1) * 80, "#f59e0b"));
            }
            tempEdges.push({
                id: `e-co-${courseCode}-${coreq}`, // Unique edge ID
                source: courseCode,
                target: coreq,
                label: "corequisite",
            });
        });

        // 5. Process Required By (reverse prerequisites)
        currentCourse.required_by?.forEach((reqBy, i) => {
            if (!nodeMap.has(reqBy)) {
                nodeMap.set(
                    reqBy,
                    createNode(reqBy, getTitle(reqBy), 300, i * 60, "#8b5cf6") // purple, right side
                );
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
            edges: tempEdges
        };
    }, [courseCode]);

    // Empty state
    if (nodes.length <= 1) {
        return (
            <div className="h-[300px] w-full border rounded-lg flex items-center justify-center bg-slate-50 text-muted-foreground">
                <p>No prerequisites or corequisites listed for this course.</p>
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
                // Prevents interaction issues in scrollable pages
                preventScrolling={false}
            />
        </div>
    );
}