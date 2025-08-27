"use client"

import React, { useRef } from 'react';
import CytoscapeGraph, { type CytoscapeGraphRef } from './CytoscapeGraph';
import type { ClNode, GraphPayload } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface AttestationGraphProps {
  data: GraphPayload | null;
  onNodeClick?: ((node: ClNode) => void) | undefined;
  className?: string;
}

export default function AttestationGraph({ data, onNodeClick, className }: AttestationGraphProps) {
  const graphRef = useRef<CytoscapeGraphRef>(null);

  const handleFit = () => {
    graphRef.current?.fit();
  };

  const handleExport = () => {
    graphRef.current?.exportPNG();
  };

  return (
    <div className={`relative bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <Button
          onClick={handleFit}
          size="sm"
          variant="secondary"
          className="shadow-sm"
          title="Fit graph to view"
        >
          🎯 Fit
        </Button>
        <Button
          onClick={handleExport}
          size="sm"
          variant="secondary"
          className="shadow-sm"
          title="Export as PNG"
        >
          📷 Export
        </Button>
      </div>
      
      <div className="p-4">
        <CytoscapeGraph
          ref={graphRef}
          data={data}
          onNodeClick={onNodeClick}
          className="h-96"
        />
      </div>
    </div>
  );
}