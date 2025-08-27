"use client"

import React, { useState } from 'react';
import { Search, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AttestationGraph from '@/components/AttestationGraph';
import TableView from '@/components/TableView';
import JsonView from '@/components/JsonView';
import DetailsDrawer from '@/components/DetailsDrawer';
import Legend from '@/components/Legend';
import ErrorBoundary from '@/components/ErrorBoundary';
import { fetchByRef, verifyAttestation } from '@/lib/fetchByRef';
import type { GraphPayload, ClNode } from '@/lib/types';

const EXAMPLE_IMAGES = [
  'cgr.dev/chainguard/static:latest',
  'cgr.dev/chainguard/cosign:latest', 
  'cgr.dev/chainguard/go:latest'
];

export default function Home() {
  const [imageRef, setImageRef] = useState('');
  const [platform, setPlatform] = useState('linux/amd64');
  const [data, setData] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState<ClNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleFetchAttestations = async () => {
    if (!imageRef.trim()) {
      setError('Please enter an image reference');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    setVerifyResult(null);

    try {
      const result = await fetchByRef(imageRef, platform);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attestations');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttestations = async () => {
    if (!imageRef.trim()) {
      setError('Please enter an image reference');
      return;
    }

    setVerifying(true);
    
    try {
      const result = await verifyAttestation(imageRef, platform);
      setVerifyResult(result);
    } catch (err: any) {
      setVerifyResult({
        success: false,
        error: err.message || 'Verification failed'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleNodeClick = (node: ClNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const handleExampleClick = (example: string) => {
    setImageRef(example);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attestation Graph
          </h1>
          <p className="text-gray-600">
            Visualize SLSA provenance and SBOM attestations from container images
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Fetch Attestations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter image reference (e.g., cgr.dev/chainguard/static:latest)"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchAttestations()}
                />
              </div>
              <div>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="linux/amd64">linux/amd64</option>
                  <option value="linux/arm64">linux/arm64</option>
                </select>
              </div>
              <Button 
                onClick={handleFetchAttestations} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Fetch
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Examples:</span>
              {EXAMPLE_IMAGES.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {example}
                </button>
              ))}
            </div>

            {data && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyAttestations} 
                  disabled={verifying}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify SBOM
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {verifyResult && (
              <div className={`p-3 rounded-lg ${
                verifyResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {verifyResult.success ? 'Verification successful!' : 'Verification failed'}
                </div>
                {verifyResult.error && (
                  <p className="mt-1 text-sm">{verifyResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        {data && (
          <ErrorBoundary>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Tabs defaultValue="graph" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="graph">Graph</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="graph" className="mt-4">
                    <ErrorBoundary fallback={
                      <Card className="h-[600px] flex items-center justify-center">
                        <CardContent>
                          <p className="text-red-600">Failed to load graph visualization</p>
                        </CardContent>
                      </Card>
                    }>
                      <AttestationGraph 
                        data={data} 
                        onNodeClick={handleNodeClick}
                        className="h-[600px]"
                      />
                    </ErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="table" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <ErrorBoundary>
                          <TableView data={data} />
                        </ErrorBoundary>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="json" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <ErrorBoundary>
                          <JsonView data={data} />
                        </ErrorBoundary>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-1">
                <ErrorBoundary>
                  <Legend />
                </ErrorBoundary>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>

      {/* Details Drawer */}
      <DetailsDrawer 
        node={selectedNode}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
