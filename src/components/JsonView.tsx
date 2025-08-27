"use client"

import React from 'react';
import { GraphPayload } from '@/lib/types';

interface JsonViewProps {
  data: GraphPayload | null;
  className?: string;
}

export default function JsonView({ data, className }: JsonViewProps) {
  if (!data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Raw Data</h3>
        <button
          onClick={() => copyToClipboard(jsonString)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Copy JSON
        </button>
      </div>
      
      <div className="border rounded-lg bg-gray-50 p-4 max-h-96 overflow-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
