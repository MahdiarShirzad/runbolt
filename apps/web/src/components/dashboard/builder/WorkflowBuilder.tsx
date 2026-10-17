"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeftIcon, BoltIcon, RetryIcon } from "@/components/landing/icons";
import {
  getSampleCredentials,
  loadLocalCredentials,
} from "@/lib/dashboard/credentials";
import {
  findCreatedWorkflow,
  loadLocalState,
  setMockGraphOverride,
  setMockStatusOverride,
  updateCreatedWorkflow,
} from "@/lib/dashboard/local-workflows";
import { hashString } from "@/lib/dashboard/random";
import type { ExecutionStatus, TriggerType, WorkflowStatus } from "@/lib/dashboard/types";
import {
  cloneGraph,
  createEdge,
  createNode,
  getOutputHandles,
  isTriggerType,
  nodeLabel,
  validateConnection,
  validateGraph,
  type GraphIssue,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowNodeType,
} from "@/lib/dashboard/workflow-graph";
import {
  mapExecutionToGraph,
  runWorkflowGraph,
  type GraphRunResult,
  type GraphRunStatus,
} from "@/lib/dashboard/workflow-run";
import { defaultGraphFor, graphToStepList } from "@/lib/dashboard/workflow-source";
import { WorkflowStatusBadge } from "../StatusBadge";
import { primaryActionCls, secondaryActionCls } from "../actions";
import { ExecutionInspector, type InspectorRun, type InspectorStep } from "./ExecutionInspector";
import { NodeConfigPanel, type CredentialOption } from "./NodeConfigPanel";
import { NODE_DRAG_MIME, NodeLibrary } from "./NodeLibrary";
import { builderNodeTypes } from "./nodes";
import {
  applyEdgeGraphChanges,
  applyNodeGraphChanges,
  toFlowEdges,
  toFlowNodes,
  type BuilderEdge,
  type BuilderNode,
} from "./graph-flow";

export interface BuilderExecution {
  id: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  durationMs: number | null;
  steps: {
    name: string;
    status: ExecutionStatus;
    durationMs: number | null;
    detail?: string;
  }[];
}

export interface BuilderWorkflow {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  triggerDetail: string | null;
  steps: string[];
  isLocal: boolean;
  version: number;
}

interface RunOverlay {
  runId: string;
  statuses: Record<string, GraphRunStatus>;
  details: Record<string, string>;
  steps: InspectorStep[];
  isSimulated: boolean;
}

type Notice = { kind: "success" | "error"; text: string } | null;
type SaveState = "saved" | "saving" | "unsaved";
type PanelTab = "config" | "runs";

const MINIMAP_COLORS: Record<string, string> = {
  trigger: "#c7f04e",
  integration: "#3ecf8e",
  action: "#8c97ab",
  transform: "#8195b5",
  condition: "#a08bf0",
  utility: "#5cc9ee",
};

function snapshotKey(name: string, description: string, graph: WorkflowGraph): string {
  return JSON.stringify({ name, description, graph });
}

function firstMessage(issues: GraphIssue[]): string | null {
  return issues.find((issue) => issue.severity === "error")?.message ?? issues[0]?.message ?? null;
}

export function WorkflowBuilder(props: {
  workflow: BuilderWorkflow;
  executions: BuilderExecution[];
}) {
  return (
    <ReactFlowProvider>
      <BuilderInner {...props} />
    </ReactFlowProvider>
  );
}

function BuilderInner({
  workflow,
  executions,
}: {
  workflow: BuilderWorkflow;
  executions: BuilderExecution[];
}) {
  const router = useRouter();
  const reactFlow = useReactFlow<BuilderNode, BuilderEdge>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [graph, setGraph] = useState<WorkflowGraph>({ nodes: [], edges: [] });
  const graphRef = useRef(graph);
  useEffect(() => {
    graphRef.current = graph;
  }, [graph]);

  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [status, setStatus] = useState<WorkflowStatus>(workflow.status);
  const [version, setVersion] = useState(workflow.version);
  const [recordId, setRecordId] = useState(workflow.id);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("config");

  const [past, setPast] = useState<WorkflowGraph[]>([]);
  const [future, setFuture] = useState<WorkflowGraph[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [notice, setNotice] = useState<Notice>(null);
  const [overlay, setOverlay] = useState<RunOverlay | null>(null);
  const [testRun, setTestRun] = useState<GraphRunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [credentials, setCredentials] = useState<CredentialOption[]>([]);

  /* ----- initial load from browser-local layer ----- */
  useEffect(() => {
    const load = () => {
      const state = loadLocalState();
      const local =
        findCreatedWorkflow(state, workflow.id) ?? findCreatedWorkflow(state, workflow.slug);
      const override = state.graphOverrides[workflow.id];
      const source = local
        ? {
            id: local.id,
            slug: local.slug,
            trigger: local.trigger,
            triggerDetail: local.triggerDetail,
            steps: local.steps,
          }
        : {
            id: workflow.id,
            slug: workflow.slug,
            trigger: workflow.trigger,
            triggerDetail: workflow.triggerDetail,
            steps: workflow.steps,
          };
      const initialGraph = local?.graph ?? override?.graph ?? defaultGraphFor(source);
      const initialName = local?.name ?? override?.name ?? workflow.name;
      const initialDescription =
        local?.description ?? override?.description ?? workflow.description;
      const initialVersion = local?.version ?? override?.version ?? workflow.version;
      const initialStatus =
        local?.status ?? state.statusOverrides[workflow.id] ?? workflow.status;

      setGraph(initialGraph);
      setName(initialName);
      setDescription(initialDescription);
      setVersion(initialVersion);
      setStatus(initialStatus);
      setRecordId(local?.id ?? workflow.id);
      setSavedSnapshot(snapshotKey(initialName, initialDescription, initialGraph));
      setMounted(true);
    };
    load();
  }, [workflow]);

  /* ----- credentials for the config panel ----- */
  useEffect(() => {
    const load = () => {
      const samples = getSampleCredentials(Date.now()).map((credential) => ({
        id: credential.id,
        name: credential.name,
      }));
      const locals = loadLocalCredentials().map((credential) => ({
        id: credential.id,
        name: credential.name,
      }));
      setCredentials([...locals, ...samples]);
    };
    load();
  }, []);

  const validation = useMemo(() => validateGraph(graph), [graph]);
  const issueNodeIds = useMemo(
    () => new Set(validation.issues.map((issue) => issue.nodeId).filter(Boolean) as string[]),
    [validation],
  );
  const issueEdgeIds = useMemo(
    () => new Set(validation.issues.map((issue) => issue.edgeId).filter(Boolean) as string[]),
    [validation],
  );
  const nodeIssuesById = useMemo(() => {
    const map = new Map<string, GraphIssue[]>();
    for (const issue of validation.issues) {
      if (!issue.nodeId) continue;
      map.set(issue.nodeId, [...(map.get(issue.nodeId) ?? []), issue]);
    }
    return map;
  }, [validation]);

  const isDirty =
    mounted && snapshotKey(name, description, graph) !== savedSnapshot;
  const effectiveSaveState: SaveState = !mounted
    ? "saved"
    : isDirty
      ? saveState === "saving"
        ? "saving"
        : "unsaved"
      : saveState === "saving"
        ? "saving"
        : "saved";

  const flowNodes = useMemo(
    () =>
      toFlowNodes(graph, {
        statuses: overlay?.statuses,
        details: overlay?.details,
        selectedNodeId,
        issueNodeIds,
      }),
    [graph, overlay, selectedNodeId, issueNodeIds],
  );
  const flowEdges = useMemo(
    () =>
      toFlowEdges(graph, {
        statuses: overlay?.statuses,
        details: overlay?.details,
        selectedEdgeId,
        issueEdgeIds,
      }),
    [graph, overlay, selectedEdgeId, issueEdgeIds],
  );

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph, selectedNodeId],
  );

  const notify = useCallback((kind: "success" | "error", text: string) => {
    setNotice({ kind, text });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const pushHistory = useCallback(() => {
    setPast((previous) => [...previous.slice(-49), cloneGraph(graphRef.current)]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((previous) => {
      if (previous.length === 0) return previous;
      const target = previous[previous.length - 1]!;
      setFuture((next) => [cloneGraph(graphRef.current), ...next].slice(0, 50));
      setGraph(cloneGraph(target));
      return previous.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((next) => {
      if (next.length === 0) return next;
      const target = next[0]!;
      setPast((previous) => [...previous.slice(-49), cloneGraph(graphRef.current)]);
      setGraph(cloneGraph(target));
      return next.slice(1);
    });
  }, []);

  /* ----- editing handlers ----- */
  const onNodesChange = useCallback(
    (changes: NodeChange<BuilderNode>[]) => {
      for (const change of changes) {
        if (change.type !== "select") continue;
        if (change.selected) {
          setSelectedNodeId(change.id);
          setSelectedEdgeId(null);
          setPanelTab("config");
        } else {
          setSelectedNodeId((current) => (current === change.id ? null : current));
        }
      }
      if (changes.some((change) => change.type === "remove")) pushHistory();
      if (
        changes.some(
          (change) => change.type === "position" || change.type === "remove",
        )
      ) {
        setGraph((current) => applyNodeGraphChanges(current, changes));
      }
    },
    [pushHistory],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<BuilderEdge>[]) => {
      for (const change of changes) {
        if (change.type !== "select") continue;
        if (change.selected) {
          setSelectedEdgeId(change.id);
          setSelectedNodeId(null);
        } else {
          setSelectedEdgeId((current) => (current === change.id ? null : current));
        }
      }
      if (changes.some((change) => change.type === "remove")) pushHistory();
      setGraph((current) => applyEdgeGraphChanges(current, changes));
    },
    [pushHistory],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const attempt = {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      const result = validateConnection(graphRef.current, attempt);
      if (!result.ok) {
        notify("error", result.reason);
        return;
      }
      pushHistory();
      const current = graphRef.current;
      setGraph({
        nodes: current.nodes,
        edges: [
          ...current.edges,
          createEdge(attempt.source, attempt.target, {
            sourceHandle: attempt.sourceHandle ?? "out",
            targetHandle: attempt.targetHandle ?? "in",
            existing: current.edges.map((edge) => edge.id),
          }),
        ],
      });
    },
    [pushHistory, notify],
  );

  const addNodeAt = useCallback(
    (type: WorkflowNodeType, position?: { x: number; y: number }) => {
      const current = graphRef.current;
      const existing = current.nodes.map((node) => node.id);
      let pos = position;
      if (!pos) {
        const rect = wrapperRef.current?.getBoundingClientRect();
        pos = reactFlow.screenToFlowPosition({
          x: (rect?.left ?? 0) + (rect?.width ?? 800) / 2,
          y: (rect?.top ?? 0) + (rect?.height ?? 600) / 2,
        });
      }
      const node = createNode(type, pos, { existing });
      pushHistory();

      const anchor = current.nodes.find((candidate) => candidate.id === selectedNodeId);
      let edges = current.edges;
      if (anchor && !isTriggerType(type)) {
        const handles = getOutputHandles(anchor);
        if (handles.length === 1) {
          const attempt = {
            source: anchor.id,
            target: node.id,
            sourceHandle: handles[0]!.id,
          };
          if (validateConnection(current, attempt).ok) {
            edges = [
              ...edges,
              createEdge(attempt.source, node.id, {
                sourceHandle: handles[0]!.id,
                existing: edges.map((edge) => edge.id),
              }),
            ];
          }
        }
      }
      setGraph({ nodes: [...current.nodes, node], edges });
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setPanelTab("config");
    },
    [pushHistory, reactFlow, selectedNodeId],
  );

  const updateSelectedNode = useCallback(
    (patch: Partial<Pick<WorkflowNode, "label" | "description" | "config">>) => {
      if (!selectedNodeId) return;
      setGraph((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === selectedNodeId ? { ...node, ...patch } : node,
        ),
      }));
    },
    [selectedNodeId],
  );

  const updateSelectedConfig = useCallback(
    (key: string, value: unknown) => {
      if (!selectedNodeId) return;
      setGraph((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === selectedNodeId
            ? { ...node, config: { ...node.config, [key]: value } }
            : node,
        ),
      }));
    },
    [selectedNodeId],
  );

  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      pushHistory();
      setGraph((current) => ({
        nodes: current.nodes.filter((node) => node.id !== selectedNodeId),
        edges: current.edges.filter(
          (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
        ),
      }));
      setSelectedNodeId(null);
      setOverlay(null);
      return;
    }
    if (selectedEdgeId) {
      pushHistory();
      setGraph((current) => ({
        ...current,
        edges: current.edges.filter((edge) => edge.id !== selectedEdgeId),
      }));
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNodeId) return;
    const current = graphRef.current;
    const original = current.nodes.find((node) => node.id === selectedNodeId);
    if (!original) return;
    const copy = createNode(original.type, {
      x: original.position.x,
      y: original.position.y + 100,
    }, {
      existing: current.nodes.map((node) => node.id),
      label: `${nodeLabel(original)} copy`,
      description: original.description,
      config: original.config,
    });
    pushHistory();
    setGraph({ ...current, nodes: [...current.nodes, copy] });
    setSelectedNodeId(copy.id);
  }, [selectedNodeId, pushHistory]);

  /* ----- persistence ----- */
  const save = useCallback((): boolean => {
    const currentGraph = graphRef.current;
    const currentValidation = validateGraph(currentGraph);
    const error = currentValidation.issues.find((issue) => issue.severity === "error");
    if (error) {
      notify("error", error.message);
      return false;
    }
    const trimmedName = name.trim() || workflow.name;
    const nextVersion = version + 1;
    setSaveState("saving");
    try {
      if (workflow.isLocal) {
        updateCreatedWorkflow(recordId, {
          graph: currentGraph,
          name: trimmedName,
          description,
          steps: graphToStepList(currentGraph),
          version: nextVersion,
        });
      } else {
        setMockGraphOverride(workflow.id, {
          graph: currentGraph,
          name: trimmedName,
          description,
          version: nextVersion,
        });
      }
      setVersion(nextVersion);
      setSavedSnapshot(snapshotKey(trimmedName, description, currentGraph));
      setSaveState("saved");
      notify("success", "Workflow saved.");
      return true;
    } catch {
      setSaveState("unsaved");
      notify("error", "Could not save to this browser.");
      return false;
    }
  }, [name, description, version, workflow, recordId, notify]);

  const toggleActive = useCallback(() => {
    const next: WorkflowStatus = status === "active" ? "paused" : "active";
    if (next === "active") {
      const currentValidation = validateGraph(graphRef.current);
      if (!currentValidation.runnable) {
        notify(
          "error",
          firstMessage(
            currentValidation.issues.filter((issue) => issue.severity !== "error"),
          ) ?? "Resolve the graph issues before activating.",
        );
        return;
      }
    }
    if (isDirty && !save()) return;
    if (workflow.isLocal) {
      updateCreatedWorkflow(recordId, { status: next });
    } else {
      setMockStatusOverride(workflow.id, next);
    }
    setStatus(next);
    notify("success", `Workflow ${next === "active" ? "activated" : "paused"}.`);
  }, [status, isDirty, save, workflow, recordId, notify]);

  /* ----- test run + execution inspector ----- */
  const applyTestRun = useCallback(
    (result: GraphRunResult) => {
      if (!result.ok) {
        notify("error", result.error ?? "The workflow could not run.");
        return;
      }
      const statuses: Record<string, GraphRunStatus> = {};
      const details: Record<string, string> = {};
      const steps: InspectorStep[] = result.steps.map((step) => {
        statuses[step.nodeId] = step.status;
        if (step.detail) details[step.nodeId] = step.detail;
        return {
          nodeId: step.nodeId,
          name: step.name,
          status: step.status,
          durationMs: step.durationMs,
          ...(step.detail ? { detail: step.detail } : {}),
        };
      });
      setTestRun(result);
      setOverlay({
        runId: `test_${result.startedAt}`,
        statuses,
        details,
        steps,
        isSimulated: true,
      });
      setPanelTab("runs");
      notify(
        result.status === "success" ? "success" : "error",
        result.status === "success"
          ? "Test run finished — this is a simulated run; the execution API is not connected."
          : "Test run reported a failure.",
      );
    },
    [notify],
  );

  const runTest = useCallback(() => {
    const currentGraph = graphRef.current;
    const currentValidation = validateGraph(currentGraph);
    if (!currentValidation.saveable) {
      notify("error", firstMessage(currentValidation.issues) ?? "Fix the graph errors first.");
      return;
    }
    if (!currentValidation.runnable) {
      notify(
        "error",
        firstMessage(
          currentValidation.issues.filter((issue) => issue.severity !== "error"),
        ) ?? "This workflow is not ready to run.",
      );
      return;
    }
    setBusy(true);
    const result = runWorkflowGraph(currentGraph, { seed: hashString(workflow.id) });
    window.setTimeout(() => {
      setBusy(false);
      applyTestRun(result);
    }, 450);
  }, [applyTestRun, notify, workflow.id]);

  const inspectorRuns: InspectorRun[] = useMemo(() => {
    const simulated: InspectorRun[] =
      testRun && testRun.ok
        ? [
            {
              id: `test_${testRun.startedAt}`,
              status: testRun.status,
              startedAt: testRun.startedAt,
              durationMs: testRun.durationMs,
              isSimulated: true,
            },
          ]
        : [];
    const recorded: InspectorRun[] = executions.map((execution) => ({
      id: execution.id,
      status: execution.status,
      startedAt: execution.startedAt,
      durationMs: execution.durationMs,
      isSimulated: false,
    }));
    return [...simulated, ...recorded];
  }, [testRun, executions]);

  const selectRun = useCallback(
    (runId: string) => {
      if (testRun && testRun.ok && runId === `test_${testRun.startedAt}`) {
        applyTestRun(testRun);
        return;
      }
      const execution = executions.find((candidate) => candidate.id === runId);
      if (!execution) return;
      const mapping = mapExecutionToGraph(graphRef.current, {
        id: execution.id,
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: execution.status,
        trigger: execution.trigger,
        startedAt: execution.startedAt,
        finishedAt: null,
        durationMs: execution.durationMs,
        steps: execution.steps.map((step) => ({
          name: step.name,
          status: step.status,
          durationMs: step.durationMs,
          ...(step.detail ? { detail: step.detail } : {}),
        })),
      });
      const statuses: Record<string, GraphRunStatus> = {};
      const details: Record<string, string> = {};
      const steps: InspectorStep[] = mapping.map((entry) => {
        statuses[entry.nodeId] = entry.status;
        if (entry.detail) details[entry.nodeId] = entry.detail;
        const node = graphRef.current.nodes.find((candidate) => candidate.id === entry.nodeId);
        return {
          nodeId: entry.nodeId,
          name: node ? nodeLabel(node) : entry.nodeId,
          status: entry.status,
          durationMs: entry.durationMs,
          ...(entry.detail ? { detail: entry.detail } : {}),
        };
      });
      setOverlay({ runId, statuses, details, steps, isSimulated: false });
      setPanelTab("runs");
    },
    [executions, testRun, applyTestRun, workflow],
  );

  const clearOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  const focusNode = useCallback(
    (nodeId: string) => {
      reactFlow.fitView({ nodes: [{ id: nodeId }], duration: 400, maxZoom: 1.2, padding: 0.8 });
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    },
    [reactFlow],
  );

  /* ----- unsaved-changes guard + shortcuts ----- */
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (meta && key === "z" && !event.shiftKey) {
        if (isEditable(event.target)) return;
        event.preventDefault();
        undo();
      } else if (meta && (key === "y" || (key === "z" && event.shiftKey))) {
        if (isEditable(event.target)) return;
        event.preventDefault();
        redo();
      } else if (meta && key === "s") {
        event.preventDefault();
        save();
      } else if ((event.key === "Delete" || event.key === "Backspace") && !isEditable(event.target)) {
        if (selectedNodeId || selectedEdgeId) {
          event.preventDefault();
          deleteSelected();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, save, deleteSelected, selectedNodeId, selectedEdgeId]);

  /* ----- drag & drop from the library ----- */
  const onDragStart = useCallback((type: WorkflowNodeType, event: DragEvent) => {
    event.dataTransfer.setData(NODE_DRAG_MIME, type);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(NODE_DRAG_MIME) as WorkflowNodeType;
      if (!type) return;
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNodeAt(type, position);
    },
    [reactFlow, addNodeAt],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const minimapColor = useCallback((node: Node) => {
    const data = node.data as { category?: string } | undefined;
    return MINIMAP_COLORS[data?.category ?? "action"] ?? "#8c97ab";
  }, []);

  const handleLeave = useCallback(() => {
    if (isDirty) {
      setConfirmLeave(true);
      return;
    }
    router.push("/workflows");
  }, [isDirty, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink" aria-busy="true">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-3 w-40 animate-pulse rounded bg-hover" />
          <div className="mx-auto h-3 w-24 animate-pulse rounded bg-hover" />
        </div>
      </div>
    );
  }

  const showEmptyHint = graph.nodes.length <= 1;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink text-fg">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line/70 bg-surface/60 px-3.5 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <ArrowLeftIcon width={13} height={13} aria-hidden />
            Workflows
          </button>
          <div className="min-w-0">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Workflow name"
              className="w-full min-w-[8rem] max-w-sm rounded border border-transparent bg-transparent px-1 py-0.5 text-[15px] font-medium text-fg outline-none transition-colors hover:border-line focus:border-primary"
            />
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a description…"
              aria-label="Workflow description"
              className="mt-0.5 w-full min-w-[8rem] max-w-md rounded border border-transparent bg-transparent px-1 text-[11.5px] text-muted outline-none transition-colors placeholder:text-faint hover:border-line focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <WorkflowStatusBadge status={status} />
          <SaveStateBadge state={effectiveSaveState} />
          {!validation.runnable && (
            <span
              title={firstMessage(validation.issues) ?? undefined}
              className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-warn"
            >
              not ready
            </span>
          )}
          <div className="flex items-center gap-1">
            <IconButton label="Undo" onClick={undo} disabled={past.length === 0}>
              <RetryIcon width={13} height={13} className="-scale-x-100" aria-hidden />
            </IconButton>
            <IconButton label="Redo" onClick={redo} disabled={future.length === 0}>
              <RetryIcon width={13} height={13} aria-hidden />
            </IconButton>
          </div>
          <button type="button" onClick={runTest} disabled={busy} className={secondaryActionCls}>
            <BoltIcon width={12} height={12} aria-hidden />
            {busy ? "Running…" : "Test run"}
          </button>
          <button type="button" onClick={toggleActive} className={secondaryActionCls}>
            {status === "active" ? "Pause" : "Activate"}
          </button>
          <button type="button" onClick={() => save()} className={primaryActionCls}>
            Save
          </button>
        </div>
      </header>

      {notice && (
        <p
          role="status"
          className={`border-b px-3.5 py-2 text-[12.5px] ${
            notice.kind === "error"
              ? "border-bad/30 bg-bad/[0.07] text-bad/90"
              : "border-line/70 bg-primary/[0.04] text-muted"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-line/70 bg-surface/40 md:block">
          <NodeLibrary onAdd={(type) => addNodeAt(type)} onDragStart={onDragStart} />
        </aside>

        <div ref={wrapperRef} className="relative min-h-0 flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={builderNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={pushHistory}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            deleteKeyCode={null}
            colorMode="dark"
            fitView
            minZoom={0.2}
            maxZoom={1.8}
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

          {showEmptyHint && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto max-w-sm rounded-lg border border-line bg-surface/90 p-5 text-center shadow-xl shadow-overlay/40">
                <p className="text-[13.5px] font-medium text-fg">Build your workflow</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  Drag nodes from the library on the left onto the canvas, or click one to add it.
                  Connect output handles to the next node&apos;s input to define the run order.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden w-[336px] shrink-0 border-l border-line/70 bg-surface/40 lg:flex lg:flex-col">
          <div className="flex border-b border-line/70" role="tablist" aria-label="Editor panels">
            {(
              [
                { id: "config" as PanelTab, label: "Configure" },
                { id: "runs" as PanelTab, label: "Runs" },
              ]
            ).map((tab) => {
              const active = panelTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPanelTab(tab.id)}
                  className={`-mb-px flex-1 border-b-2 px-3 py-2.5 text-[12.5px] transition-colors ${
                    active
                      ? "border-primary font-medium text-fg"
                      : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="min-h-0 flex-1">
            {panelTab === "config" ? (
              <NodeConfigPanel
                node={selectedNode}
                issues={selectedNodeId ? nodeIssuesById.get(selectedNodeId) ?? [] : []}
                credentials={credentials}
                onChange={updateSelectedNode}
                onConfigChange={updateSelectedConfig}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onClose={() => setSelectedNodeId(null)}
              />
            ) : (
              <ExecutionInspector
                runs={inspectorRuns}
                selectedRunId={overlay?.runId ?? null}
                selectedSteps={overlay?.steps ?? null}
                onSelectRun={selectRun}
                onClearRun={clearOverlay}
                onFocusNode={focusNode}
                busy={busy}
              />
            )}
          </div>
        </aside>
      </div>

      {confirmLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-builder-title"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={() => setConfirmLeave(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-lg border border-line bg-surface p-5 shadow-2xl shadow-overlay/40">
            <h2
              id="leave-builder-title"
              className="font-display text-lg font-semibold text-fg"
            >
              Leave without saving?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              You have unsaved changes to “{name}”. Leaving now discards them.
            </p>
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmLeave(false)}
                className={secondaryActionCls}
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => router.push("/workflows")}
                className="inline-flex h-9 items-center justify-center rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10"
              >
                Discard & leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveStateBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; cls: string; dot: string }> = {
    saved: { label: "Saved", cls: "text-muted", dot: "bg-ok" },
    saving: { label: "Saving", cls: "text-volt", dot: "bg-volt blink" },
    unsaved: { label: "Unsaved changes", cls: "text-warn", dot: "bg-warn" },
  };
  const value = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${value.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${value.dot}`} aria-hidden />
      {value.label}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
