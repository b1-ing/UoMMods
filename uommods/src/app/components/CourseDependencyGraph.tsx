"use client";
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";

type Props = {
    courseCode: string;
};

export default function CourseDependencyGraph({ courseCode }: Props) {
    const course = courses[courseCode as keyof typeof courses];

    const makeMainNode = (code: string, type: string,x:number, y: number, color: string) => ({



        id: code,
        position: {x, y},
        data: {
            label: `${code} - ${courses[code as keyof typeof courses]?.title ?? ""}`,
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
            label: `${code} - ${courses[code as keyof typeof courses]?.title ?? ""} `,
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
        makeMainNode(courseCode, "Main",0, 0, "#2563eb"), // Blue

        ...(course.prerequisitesList?.split(",").map(s => s.trim()) ?? []).map((pr, i) =>
            makeNode(pr, "Prerequisite",-400, 50 * i, "#10b981") // Green
        ),

        ...(course.corequisitesList?.split(",").map(s => s.trim()) ?? []).map((co, i) =>
            makeMainNode(co, "Corequisite",0, 50 * (i+1), "#f59e0b") // Yellow
        ),

        ...(course.requiredBy?.split(",").map(s => s.trim()) ?? []).map((rb, i) =>
            makeNode(rb, "Required By", 400, 50 * i, "#ef4444") // Red
        ),
    ];

    const edges = [
        ...(course.prerequisitesList?.split(",").map(s => s.trim()) ?? []).map((pr) => ({
            id: `pr-${pr}`,
            source: pr,
            target: courseCode,
            label: "prerequisite of",
        })),
        ...(course.corequisitesList?.split(",").map(s => s.trim()) ?? []).map((co) => ({
            id: `co-${co}`,
            source: courseCode,
            target: co,
            label: "corequisite of",
        })),
        ...(course.requiredBy?.split(",").map(s => s.trim()) ?? []).map((rb) => ({
            id: `rb-${rb}`,
            source: courseCode,
            target: rb,
            label: "required by",
        })),
    ];
    const [nodesState, , onNodesChange] = useNodesState(nodes);
    const [edgesState, , onEdgesChange] = useEdgesState(edges);
    if (!course) return <p>Course not found</p>;




    // Helper: Generate a node
    
    


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
            >
            </ReactFlow>
        </div>
    );
}
