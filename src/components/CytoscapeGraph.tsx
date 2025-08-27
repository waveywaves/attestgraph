"use client";

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import type { Core, ElementDefinition } from 'cytoscape';
import type { NodeType, ClNode, GraphPayload } from '@/lib/types';
import { truncateText } from '@/lib/utils';

interface CytoscapeGraphProps {
  data: GraphPayload | null;
  onNodeClick?: ((node: ClNode) => void) | undefined;
  className?: string;
}

export interface CytoscapeGraphRef {
  fit: () => void;
  exportPNG: () => void;
  getInstance: () => Core | null;
}

const NODE_STYLES: Record<NodeType, { color: string; shape: string; size: number }> = {
  IMAGE: { color: '#8b5cf6', shape: 'round-rectangle', size: 80 },
  PROVENANCE: { color: '#1f2937', shape: 'rectangle', size: 70 },
  SBOM_JSON: { color: '#ea580c', shape: 'ellipse', size: 65 },
  APKO_CONFIG: { color: '#6b7280', shape: 'ellipse', size: 60 },
  GIT_HEAD_COMMIT: { color: '#16a34a', shape: 'ellipse', size: 60 },
  MORE_REFERENCES: { color: '#9ca3af', shape: 'ellipse', size: 55 },
  ATTESTATION: { color: '#1f2937', shape: 'rectangle', size: 70 },
};

const CytoscapeGraph = React.forwardRef<CytoscapeGraphRef, CytoscapeGraphProps>(
  ({ data, onNodeClick, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyInstanceRef = useRef<Core | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cytoscape, setCytoscape] = useState<any>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      fit: () => {
        if (cyInstanceRef.current) {
          cyInstanceRef.current.fit(undefined, 50);
        }
      },
      exportPNG: () => {
        if (cyInstanceRef.current) {
          const png = cyInstanceRef.current.png({
            output: 'blob',
            bg: '#ffffff',
            full: true,
            scale: 2,
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(png);
          link.download = `attestation-graph-${Date.now()}.png`;
          link.click();
        }
      },
      getInstance: () => cyInstanceRef.current,
    }), []);

    // Load cytoscape dynamically
    useEffect(() => {
      const loadCytoscape = async () => {
        try {
          if (typeof window !== 'undefined') {
            const [cytoscapeModule, coseBilkentModule] = await Promise.all([
              import('cytoscape'),
              import('cytoscape-cose-bilkent')
            ]);
            
            const cy = cytoscapeModule.default;
            cy.use(coseBilkentModule.default);
            setCytoscape(() => cy);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Failed to load cytoscape:', err);
          setError('Failed to load graph library');
          setIsLoading(false);
        }
      };
      
      loadCytoscape();
    }, []);

    // Initialize graph when data changes
    useEffect(() => {
      if (!containerRef.current || !cytoscape || !data || isLoading) {
        return;
      }

      try {
        // Clean up existing instance
        if (cyInstanceRef.current) {
          cyInstanceRef.current.destroy();
          cyInstanceRef.current = null;
        }

        // Transform data
        const nodes: ElementDefinition[] = data.nodes.map(node => ({
          data: {
            id: node.id,
            label: truncateText(node.name, 20),
            type: node.type,
            originalData: node,
          }
        }));

        const edges: ElementDefinition[] = data.edges.map(edge => ({
          data: {
            id: edge.id,
            source: edge.from,
            target: edge.to,
            label: edge.label || '',
          }
        }));

        const elements = [...nodes, ...edges];

        // Create stylesheet
        const stylesheet = [
          {
            selector: 'node',
            style: {
              'width': (ele: any) => NODE_STYLES[ele.data('type') as NodeType]?.size || 60,
              'height': (ele: any) => NODE_STYLES[ele.data('type') as NodeType]?.size || 60,
              'background-color': (ele: any) => NODE_STYLES[ele.data('type') as NodeType]?.color || '#666',
              'shape': (ele: any) => NODE_STYLES[ele.data('type') as NodeType]?.shape || 'ellipse',
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#ffffff',
              'text-outline-color': '#000000',
              'text-outline-width': 1,
              'font-size': '11px',
              'font-weight': '600',
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'border-width': 2,
              'border-color': '#ffffff',
              'border-opacity': 0.8,
              'cursor': 'pointer',
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#64748b',
              'target-arrow-color': '#64748b',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '9px',
              'text-rotation': 'autorotate',
              'color': '#475569',
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#3b82f6',
              'border-opacity': 1,
            }
          },
        ];

        // Create layout
        const layout = {
          name: 'cose-bilkent',
          randomize: false,
          componentSpacing: 100,
          nodeOverlap: 20,
          idealEdgeLength: 120,
          nodeRepulsion: 400000,
        };

        // Initialize cytoscape
        const cy = cytoscape({
          container: containerRef.current,
          elements,
          style: stylesheet,
          layout,
          userZoomingEnabled: true,
          userPanningEnabled: true,
          wheelSensitivity: 0.2,
          minZoom: 0.3,
          maxZoom: 3,
        });

        // Add event listeners
        cy.on('tap', 'node', (event: any) => {
          const node = event.target;
          const originalData = node.data('originalData');
          if (onNodeClick && originalData) {
            onNodeClick(originalData);
          }
        });

        // Auto-fit after layout
        cy.one('layoutstop', () => {
          setTimeout(() => {
            cy.fit(undefined, 50);
          }, 100);
        });

        cyInstanceRef.current = cy;

      } catch (err) {
        console.error('Failed to initialize graph:', err);
        setError('Failed to create graph');
      }
    }, [data, cytoscape, onNodeClick, isLoading]);

    // Cleanup
    useEffect(() => {
      return () => {
        if (cyInstanceRef.current) {
          cyInstanceRef.current.destroy();
          cyInstanceRef.current = null;
        }
      };
    }, []);

    if (error) {
      return (
        <div className={`flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-dashed border-red-300 ${className}`}>
          <div className="text-center">
            <p className="text-red-600 text-lg mb-2">Graph Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No attestation data</p>
            <p className="text-gray-400 text-sm">Enter an image reference to fetch and visualize attestations</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={`flex items-center justify-center h-96 bg-white rounded-lg border ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading graph...</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        ref={containerRef} 
        className={`w-full h-96 bg-white rounded-lg border ${className}`}
        role="img"
        aria-label="Attestation graph visualization"
      />
    );
  }
);

CytoscapeGraph.displayName = 'CytoscapeGraph';

export default CytoscapeGraph;