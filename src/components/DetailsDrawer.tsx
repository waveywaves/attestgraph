"use client"

import React from 'react';
import { X, Info, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { ClNode, GraphPayload } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { getConceptByNodeType } from '@/lib/security-knowledge';
import { assessNodeSecurity, getTrustLevelBadge, getRiskLevelBadge } from '@/lib/risk-assessment';

interface DetailsDrawerProps {
  node: ClNode | null;
  isOpen: boolean;
  onClose: () => void;
  graphData?: GraphPayload; // Added to support risk assessment
}

export default function DetailsDrawer({ node, isOpen, onClose, graphData }: DetailsDrawerProps) {
  if (!isOpen || !node) {
    return null;
  }

  const concept = getConceptByNodeType(node.type);
  const security = graphData ? assessNodeSecurity(node, graphData) : null;
  const trustBadge = security ? getTrustLevelBadge(security.trustLevel) : null;
  const riskBadge = security ? getRiskLevelBadge(security.riskLevel) : null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl border-l z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Component Details</h2>
            <p className="text-sm text-gray-600">Understanding your software supply chain</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Educational Context */}
          {concept && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <Info className="h-5 w-5" />
                  What is {concept.term}?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-800">{concept.shortDescription}</p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-blue-900 hover:text-blue-700">
                    Learn more
                  </summary>
                  <div className="mt-2 space-y-2 pl-4 border-l-2 border-blue-200">
                    <p className="text-blue-700">{concept.detailedDescription}</p>
                    
                    <div>
                      <h5 className="font-medium text-blue-900">Business Impact:</h5>
                      <p className="text-blue-700">{concept.businessImpact}</p>
                    </div>

                    {concept.actionableAdvice && (
                      <div>
                        <h5 className="font-medium text-blue-900">What You Should Do:</h5>
                        <p className="text-blue-700">{concept.actionableAdvice}</p>
                      </div>
                    )}

                    {concept.learnMoreUrls && concept.learnMoreUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {concept.learnMoreUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Learn more <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </CardContent>
            </Card>
          )}

          {/* Security Assessment */}
          {security && (trustBadge || riskBadge) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                  <Shield className="h-5 w-5" />
                  Security Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trust and Risk Badges */}
                <div className="flex gap-3">
                  {trustBadge && (
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: trustBadge.bgColor,
                          color: trustBadge.textColor
                        }}
                      >
                        <span>{trustBadge.icon}</span>
                        {trustBadge.label}
                      </div>
                    </div>
                  )}
                  {riskBadge && (
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: riskBadge.bgColor,
                          color: riskBadge.textColor
                        }}
                      >
                        {riskBadge.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">Security Score</span>
                    <span className="text-sm font-bold text-orange-900">{security.score}/100</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${security.score}%`,
                        backgroundColor: security.score >= 80 ? '#16a34a' : security.score >= 60 ? '#eab308' : '#dc2626'
                      }}
                    />
                  </div>
                </div>

                {/* Issues */}
                {security.issues && security.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-orange-900 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Security Issues ({security.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {security.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded text-xs ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="font-medium capitalize">{issue.severity} - {issue.type.replace('_', ' ')}</div>
                          <div>{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {security.recommendations && security.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-orange-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {security.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-orange-700 flex items-start gap-1">
                          <span className="text-orange-500 mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Component Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{node.name}</span>
                <Tooltip content={`This is a ${node.type.replace('_', ' ').toLowerCase()} component`}>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded uppercase tracking-wide font-medium">
                    {node.type.replace('_', ' ')}
                  </span>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {node.id && (
                <div>
                  <Tooltip content="Unique identifier for this component">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 cursor-help underline decoration-dotted">ID</h4>
                  </Tooltip>
                  <p className="text-sm text-gray-600 break-all font-mono bg-gray-50 p-2 rounded">{node.id}</p>
                </div>
              )}

              {node.uri && (
                <div>
                  <Tooltip content="The source location or reference for this component">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 cursor-help underline decoration-dotted">Source URI</h4>
                  </Tooltip>
                  <p className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">{node.uri}</p>
                  {node.uri.startsWith('http') && (
                    <a
                      href={node.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {node.digest && (
                <div>
                  <Tooltip content="Cryptographic hash that uniquely identifies this exact version">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 cursor-help underline decoration-dotted">Digest</h4>
                  </Tooltip>
                  <p className="text-sm text-gray-600 break-all font-mono bg-gray-50 p-2 rounded">{node.digest}</p>
                </div>
              )}

              {node.meta && (
                <div>
                  <Tooltip content="Additional metadata and properties for this component">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 cursor-help underline decoration-dotted">Technical Details</h4>
                  </Tooltip>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 font-medium">
                      View raw metadata
                    </summary>
                    <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-x-auto max-h-64">
                      {formatValue(node.meta)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
