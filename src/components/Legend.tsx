"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import type { NodeType } from '@/lib/types';
import { getConceptByNodeType } from '@/lib/security-knowledge';
import { TRUST_LEVEL_STYLES } from '@/lib/risk-assessment';

const LEGEND_ITEMS: Array<{ type: NodeType; color: string; shape: string; description: string; size: number; importance: 'critical' | 'high' | 'medium' | 'low' }> = [
  { type: 'IMAGE', color: '#8b5cf6', shape: 'rounded-rectangle', description: 'Container Image', size: 16, importance: 'critical' },
  { type: 'PROVENANCE', color: '#1f2937', shape: 'rectangle', description: 'SLSA Provenance', size: 14, importance: 'high' },
  { type: 'SBOM_JSON', color: '#ea580c', shape: 'circle', description: 'SBOM (SPDX)', size: 13, importance: 'high' },
  { type: 'APKO_CONFIG', color: '#6b7280', shape: 'circle', description: 'APKO Configuration', size: 12, importance: 'medium' },
  { type: 'GIT_HEAD_COMMIT', color: '#16a34a', shape: 'circle', description: 'Git Commit', size: 12, importance: 'medium' },
  { type: 'MORE_REFERENCES', color: '#9ca3af', shape: 'circle', description: 'Other References', size: 11, importance: 'low' },
  { type: 'ATTESTATION', color: '#1f2937', shape: 'rectangle', description: 'Attestation', size: 14, importance: 'high' },
];

interface LegendProps {
  className?: string;
}

export default function Legend({ className }: LegendProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Component Types Legend */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Component Types
            <Tooltip content="Different types of components in your software supply chain">
              <span className="text-xs text-gray-500 cursor-help">?</span>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEGEND_ITEMS.map((item) => {
              const concept = getConceptByNodeType(item.type);
              const importanceColors = {
                critical: 'border-red-200 bg-red-50',
                high: 'border-orange-200 bg-orange-50',
                medium: 'border-yellow-200 bg-yellow-50',
                low: 'border-gray-200 bg-gray-50'
              };
              
              return (
                <Tooltip
                  key={item.type}
                  content={
                    <div className="max-w-xs">
                      <div className="font-medium mb-1">{concept?.term || item.description}</div>
                      <div className="text-xs">{concept?.shortDescription || `${item.description} component in the supply chain`}</div>
                      <div className="text-xs mt-1 opacity-80">Click any component to learn more</div>
                    </div>
                  }
                >
                  <div className={`p-2 rounded border cursor-help transition-all hover:shadow-sm ${importanceColors[item.importance]}`}>
                    <div className="flex items-center gap-3">
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
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          {item.type.replace('_', ' ')}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            item.importance === 'critical' ? 'bg-red-100 text-red-700' :
                            item.importance === 'high' ? 'bg-orange-100 text-orange-700' :
                            item.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.importance}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trust Levels Legend */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🛡️ Trust Levels
            <Tooltip content="How much you can trust each component based on verification">
              <span className="text-xs text-gray-500 cursor-help">?</span>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(TRUST_LEVEL_STYLES).map(([level, style]) => (
              <Tooltip
                key={level}
                content={
                  <div className="max-w-xs">
                    <div className="font-medium mb-1">{style.label}</div>
                    <div className="text-xs">
                      {level === 'verified' && 'Component has been cryptographically verified with complete attestations'}
                      {level === 'partial' && 'Component has some verification but may be missing certain attestations'}
                      {level === 'untrusted' && 'Component lacks proper verification or has security issues'}
                      {level === 'unknown' && 'Unable to determine verification status of this component'}
                    </div>
                  </div>
                }
              >
                <div className="p-2 rounded border cursor-help transition-all hover:shadow-sm" style={{ backgroundColor: style.bgColor, borderColor: style.color }}>
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{style.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: style.textColor }}>
                        {style.label}
                      </div>
                      <div className="text-xs" style={{ color: style.textColor, opacity: 0.8 }}>
                        {level === 'verified' && 'Highest security confidence'}
                        {level === 'partial' && 'Some security assurance'}
                        {level === 'untrusted' && 'Security concerns present'}
                        {level === 'unknown' && 'Verification status unclear'}
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="w-full border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs text-blue-800">
            <li className="flex items-start gap-1">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Click any node to view detailed security information</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Hover over elements for educational tooltips</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Green components are more secure than red ones</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Missing attestations increase security risk</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
