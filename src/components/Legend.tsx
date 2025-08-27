"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { NodeType } from '@/lib/types';

const LEGEND_ITEMS: Array<{ type: NodeType; color: string; shape: string; description: string; size: number }> = [
  { type: 'IMAGE', color: '#8b5cf6', shape: 'rounded-rectangle', description: 'Container Image', size: 16 },
  { type: 'PROVENANCE', color: '#1f2937', shape: 'rectangle', description: 'SLSA Provenance', size: 14 },
  { type: 'SBOM_JSON', color: '#ea580c', shape: 'circle', description: 'SBOM (SPDX)', size: 13 },
  { type: 'APKO_CONFIG', color: '#6b7280', shape: 'circle', description: 'APKO Configuration', size: 12 },
  { type: 'GIT_HEAD_COMMIT', color: '#16a34a', shape: 'circle', description: 'Git Commit', size: 12 },
  { type: 'MORE_REFERENCES', color: '#9ca3af', shape: 'circle', description: 'Other References', size: 11 },
  { type: 'ATTESTATION', color: '#1f2937', shape: 'rectangle', description: 'Attestation', size: 14 },
];

interface LegendProps {
  className?: string;
}

export default function Legend({ className }: LegendProps) {
  return (
    <Card className={`w-64 ${className}`}>
      <CardHeader>
        <CardTitle className="text-base">Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.type} className="flex items-center gap-3">
              <div 
                className="flex-shrink-0 border-2 border-white shadow-sm"
                style={{ 
                  backgroundColor: item.color,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                  borderRadius: item.shape === 'circle' ? '50%' : 
                               item.shape === 'rounded-rectangle' ? '4px' : '2px'
                }}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{item.type.replace('_', ' ')}</div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
