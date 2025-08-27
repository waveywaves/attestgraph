export type NodeType = 
  | 'IMAGE'
  | 'PROVENANCE' 
  | 'SBOM_JSON'
  | 'APKO_CONFIG'
  | 'GIT_HEAD_COMMIT'
  | 'MORE_REFERENCES'
  | 'ATTESTATION';

export interface ClNode {
  id: string;
  type: NodeType;
  name: string;
  uri?: string;
  digest?: string;
  meta?: any;
}

export interface ClEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface GraphPayload {
  root: string;
  nodes: ClNode[];
  edges: ClEdge[];
  raw: any;
}

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: NodeType;
    originalData: ClNode;
  };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label?: string;
  };
}
