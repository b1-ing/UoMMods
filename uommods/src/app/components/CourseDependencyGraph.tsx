"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "@/lib/supabase";

type Props = {
    courseCode: string;
};

export default function CourseDependencyGraph({ courseCode }: Props) {
    const [course, setCourse] = useState<any>(null);
    const [nodesState, setNodesState, onNodesChange] = useNodesState([]);
    const [edgesState, setEdgesState, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: course, error } = await supabase
                .from("courses")
                .select("*")
                .eq("code", courseCode)
                .single();

            if (error || !course) {
                setCourse(null);
                return;
            }

            setCourse(course);

            const makeNode = (
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

            const relatedCodes = [
                ...(course.prerequisites_list?.split(",") ?? []),
                ...(course.corequisites_list?.split(",") ?? []),
                ...(course.required_by?.split(",") ?? []),
            ].map(c => c.trim()).filter(Boolean);

            const { data: relatedCourses, error: relError } = await supabase
                .from("courses")
                .select("code, title")
                .in("code", relatedCodes);

            const titleMap = new Map<string, string>();
            relatedCourses?.forEach(c => titleMap.set(c.code, c.title));

// Nodes
            const nodes = [
                makeNode(courseCode, `${courseCode} - ${course.title ?? ""}`, 0, 0, "#2563eb"),

                ...(course.prerequisites_list?.split(",").map((pr: string, i: number) =>
                    makeNode(
                        pr.trim(),
                        `${pr.trim()} - ${titleMap.get(pr.trim()) ?? ""}`,
                        -400,
                        50 * i,
                        "#10b981"
                    )
                ) ?? []),

                ...(course.corequisites_list?.split(",").map((co: string, i: number) =>
                    makeNode(
                        co.trim(),
                        `${co.trim()} - ${titleMap.get(co.trim()) ?? ""}`,
                        0,
                        50 * (i + 1),
                        "#f59e0b"
                    )
                ) ?? []),

                ...(course.required_by?.split(",").map((rb: string, i: number) =>
                    makeNode(
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

            setNodesState(nodes);
            setEdgesState(edges);
        };

        fetchData();
    }, [courseCode, setNodesState, setEdgesState]);

    if (course === null) return <p className="text-red-600">❌ Course not found</p>;
    if (!course) return <p>🔄 Loading course data...</p>;

    return (
        <div className="h-[500px] w-full border rounded-lg">
            <ReactFlow
                nodes={nodesState}
                edges={edgesState}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                fitView
            />
        </div>
    );
}
