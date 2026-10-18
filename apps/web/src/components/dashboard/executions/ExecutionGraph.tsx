"use client";

import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { builderNodeTypes } from "@/components/dashboard/builder/nodes";
import {
  toFlowEdges,
  toFlowNodes,
  type BuilderEdge,
  type BuilderNode,
} from "@/components/dashboard/builder/graph-flow";
import type { GraphRunStatus } from "@/lib/dashboard/workflow-run";
import type { WorkflowGraph } from "@/lib/dashboard/workflow-graph";

const MINIMAP_COLORS: Record<GraphRunStatus, string> = {
  success: "#3ecf8e",
  failed: "#f2614e",
  running: "#c7f04e",
  queued: "#2a3446",
  cancelled: "#47536e",
  skipped: "#47536e",
  pending: "#2a3446",
};

const LEGEND: { status: GraphRunStatus; label: string; dot: string }[] = [
  { status: "success", label: "Succeeded", dot: "bg-ok" },
  { status: "failed", label: "Failed", dot: "bg-bad" },
  { status: "running", label: "Running", dot: "bg-volt" },
  { status: "skipped", label: "Skipped", dot: "bg-state-skipped" },
  { status: "pending", label: "Not executed", dot: "bg-state-idle" },
];

function Focuser({
  graph,
  nodeId,
  nonce,
}: {
  graph: WorkflowGraph;
  nodeId: string | null;
  nonce: number;
}) {
  const reactFlow = useReactFlow<BuilderNode, BuilderEdge>();
  useEffect(() => {
    if (!nodeId) return;
    const node = graph.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) return;
    reactFlow.setCenter(node.position.x + 114, node.position.y + 45, {
      zoom: 1.1,
      duration: 380,
    });
  }, [nodeId, nonce, graph, reactFlow]);
  return null;
}

/**
 * Read-only execution graph. Reuses the workflow builder's node renderer and
 * flow projection so edit and debug views stay visually identical.
 */
export function ExecutionGraph({
  graph,
  statuses,
  details,
  selectedNodeId,
  onSelectNode,
  focusNodeId,
  focusNonce = 0,
  className = "h-[420px] lg:h-[520px]",
}: {
  graph: WorkflowGraph;
  statuses: Record<string, GraphRunStatus>;
  details?: Record<string, string>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  focusNodeId?: string | null;
  focusNonce?: number;
  className?: string;
}) {
  const nodes = useMemo(
    () => toFlowNodes(graph, { statuses, details, selectedNodeId }),
    [graph, statuses, details, selectedNodeId],
  );
  const edges = useMemo(() => toFlowEdges(graph, { statuses }), [graph, statuses]);

  const minimapColor = useMemo(
    () => (node: BuilderNode) =>
      MINIMAP_COLORS[node.data.runStatus ?? "pending"],
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line/70 px-4 py-2.5">
        {LEGEND.map((item) => (
          <span
            key={item.status}
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint"
          >
            <span className={`h-2 w-2 rounded-full ${item.dot}`} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
      <div className={`relative w-full ${className}`}>
        <ReactFlowProvider>
          <ReactFlow<BuilderNode, BuilderEdge>
            nodes={nodes}
            edges={edges}
            nodeTypes={builderNodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => onSelectNode(node.id)}
            onPaneClick={() => onSelectNode(null)}
            deleteKeyCode={null}
            colorMode="dark"
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#232c3b" />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={minimapColor}
              maskColor="rgba(5,7,11,0.7)"
              className="!bg-surface"
            />
          </ReactFlow>
          <Focuser graph={graph} nodeId={focusNodeId ?? null} nonce={focusNonce} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
