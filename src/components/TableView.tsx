"use client"

import React from 'react';
import { GraphPayload } from '@/lib/types';

interface TableViewProps {
  data: GraphPayload | null;
  className?: string;
}

export default function TableView({ data, className }: TableViewProps) {
  if (!data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Nodes Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Nodes</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">URI</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Digest</th>
              </tr>
            </thead>
            <tbody>
              {data.nodes.map((node, index) => (
                <tr key={node.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800 max-w-xs truncate">{node.id}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {node.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 max-w-xs truncate">{node.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                    {node.uri ? (
                      <a 
                        href={node.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {node.uri}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-600 max-w-xs truncate">
                    {node.digest || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edges Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Relationships</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">From</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Relationship</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">To</th>
              </tr>
            </thead>
            <tbody>
              {data.edges.map((edge, index) => (
                <tr key={edge.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800 max-w-xs truncate">{edge.from}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {edge.label || 'connected to'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800 max-w-xs truncate">{edge.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
