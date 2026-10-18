import type { WorkflowGraph } from "./workflow-graph";

/**
 * Deterministic layered layout for the graph canvas.
 *
 * Nodes are placed in columns by their longest-path depth from a root, and
 * stacked within a column by their order in the node list. This is a small
 * dependency-free alternative to a full layout engine (e.g. dagre) and is good
 * enough for a "Tidy up" action in the prototype editor.
 */

const COLUMN_WIDTH = 300;
const ROW_HEIGHT = 160;
const ORIGIN = { x: 40, y: 80 };

export function autoLayoutGraph(graph: WorkflowGraph): WorkflowGraph {
  if (graph.nodes.length === 0) return graph;

  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    if (!inDegree.has(edge.target) || !adjacency.has(edge.source)) continue;
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const layer = new Map<string, number>();
  const remaining = new Map(inDegree);
  const queue = graph.nodes
    .filter((node) => (inDegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  for (const id of queue) layer.set(id, 0);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const base = layer.get(id) ?? 0;
    for (const next of adjacency.get(id) ?? []) {
      layer.set(next, Math.max(layer.get(next) ?? 0, base + 1));
      const degree = (remaining.get(next) ?? 0) - 1;
      remaining.set(next, degree);
      if (degree === 0) queue.push(next);
    }
  }

  const usedRows = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  for (const node of graph.nodes) {
    // Nodes inside a cycle never get a layer — fall back to column 0.
    const column = layer.get(node.id) ?? 0;
    const row = usedRows.get(column) ?? 0;
    usedRows.set(column, row + 1);
    positions.set(node.id, {
      x: ORIGIN.x + column * COLUMN_WIDTH,
      y: ORIGIN.y + row * ROW_HEIGHT,
    });
  }

  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
  };
}
