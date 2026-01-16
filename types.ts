import * as d3 from 'd3';

export interface UseCase {
  id: string; // e.g., AO-ACC-001
  description: string; // The text description
  tactics: string[]; // List of tactics
  techniques: string[]; // List of techniques
  category?: 'Entra ID' | 'XDR' | 'Windows' | 'Office 365' | 'Unknown';
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: string; // The primary tactic (used for initial coloring/grouping logic if needed)
  radius: number;
  data: UseCase;
  type: 'tactic' | 'usecase';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}