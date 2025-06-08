"use client";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { courses } from "@/lib/mockcourses";

type Props = {
    courseCode: string;
};

export default function CourseDependencyGraph({ courseCode }: Props) {
    const course = courses[courseCode];

    if (!course) return <p>Course not found</p>;

    // Helper: Generate a node
    const makeMainNode = (code: string, type: string,x:number, y: number, color: string) => ({



        id: code,
        position: {x, y},
        data: {
            label: `${code} - ${courses[code]?.title ?? ""}`,
        },
        style: {
            border: `2px solid ${color}`,
            padding: 8,
            borderRadius: 8,
            width: 250,
        },

        sourcePosition: Position.Right,
        targetPosition: Position.Left,






    });

    const makeNode = (code: string, type: string,x:number, y: number, color: string) => ({
        id: code,
        position: { x, y },
        data: {
            label: `${code} - ${courses[code]?.title ?? ""} `,
        },
        style: {
            border: `2px solid ${color}`,
            padding: 8,
            borderRadius: 8,
            width: 250,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,

    });
    // Nodes: central + related
    const nodes = [
        makeMainNode(courseCode, "Main",50, 0, "#2563eb"), // Blue

        ...(course.prerequisitesList ?? []).map((pr, i) =>
            makeNode(pr, "Prerequisite",-250, 50 * i -200, "#10b981") // Green
        ),

        ...(course.corequisite ?? []).map((co, i) =>
            makeMainNode(co, "Corequisite",50, 50 * (i+1), "#f59e0b") // Yellow
        ),

        ...(course.requiredBy ?? []).map((rb, i) =>
            makeNode(rb, "Required By", 350, 50 * i +100, "#ef4444") // Red
        ),
    ];

    const edges = [
        ...(course.prerequisitesList ?? []).map((pr) => ({
            id: `pr-${pr}`,
            source: pr,
            target: courseCode,
            label: "prerequisite of",
        })),
        ...(course.corequisite ?? []).map((co) => ({
            id: `co-${co}`,
            source: courseCode,
            target: co,
            label: "corequisite of",
        })),
        ...(course.requiredBy ?? []).map((rb) => ({
            id: `rb-${rb}`,
            source: courseCode,
            target: rb,
            label: "required by",
        })),
    ];

    const [nodesState, , onNodesChange] = useNodesState(nodes);
    const [edgesState, , onEdgesChange] = useEdgesState(edges);

    return (
        <div className="h-[400px] w-full border rounded-lg">
            <ReactFlow
                nodes={nodesState}
                edges={edgesState}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                fitView
            >
            </ReactFlow>
        </div>
    );
}
