"use client"

import React from 'react';
import { X } from 'lucide-react';
import { ClNode } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DetailsDrawerProps {
  node: ClNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailsDrawer({ node, isOpen, onClose }: DetailsDrawerProps) {
  if (!isOpen || !node) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Node Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{node.name}</CardTitle>
            <div className="text-sm text-gray-600">Type: {node.type}</div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {node.id && (
              <div>
                <h4 className="font-medium text-sm">ID</h4>
                <p className="text-sm text-gray-600 break-all">{node.id}</p>
              </div>
            )}

            {node.uri && (
              <div>
                <h4 className="font-medium text-sm">URI</h4>
                <p className="text-sm text-gray-600 break-all">{node.uri}</p>
              </div>
            )}

            {node.digest && (
              <div>
                <h4 className="font-medium text-sm">Digest</h4>
                <p className="text-sm text-gray-600 break-all font-mono">{node.digest}</p>
              </div>
            )}

            {node.meta && (
              <div>
                <h4 className="font-medium text-sm">Metadata</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {formatValue(node.meta)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
