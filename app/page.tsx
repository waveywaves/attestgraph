"use client"

import React, { useState } from 'react';
import { Search, Shield, AlertCircle, Info, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import AttestationGraph from '@/components/AttestationGraph';
import TableView from '@/components/TableView';
import JsonView from '@/components/JsonView';
import DetailsDrawer from '@/components/DetailsDrawer';
import Legend from '@/components/Legend';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import GuidedTour from '@/components/GuidedTour';
import { fetchByRef, verifyAttestation } from '@/lib/fetchByRef';
import { assessGraphSecurity, getTrustLevelBadge } from '@/lib/risk-assessment';
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
  const [tourOpen, setTourOpen] = useState(false);

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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Attestation Graph
                <Tooltip content="A tool to visualize and understand the security attestations of your container images">
                  <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                </Tooltip>
              </h1>
              <p className="text-gray-600 mb-3">
                Visualize SLSA provenance and SBOM attestations from container images
              </p>
                              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-600">
                  <Info className="h-4 w-4" />
                  <span>Supply Chain Security Made Simple</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTourOpen(true)}
                  className="flex items-center gap-1 text-xs"
                >
                  <HelpCircle className="h-3 w-3" />
                  Take Tour
                </Button>
              </div>
            </div>
            
            {/* Overall Security Status */}
            {data && (
              <div className="ml-6">
                <SecurityOverview data={data} />
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Fetch Attestations
              <Tooltip content="Enter a container image reference to fetch and analyze its security attestations">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Enter image reference (e.g., cgr.dev/chainguard/static:latest)"
                    value={imageRef}
                    onChange={(e) => setImageRef(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFetchAttestations()}
                    className="pr-8"
                  />
                  <Tooltip content="Container image references can be in format 'registry/namespace/image:tag' or include digest like '@sha256:...'">
                    <Info className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
              </div>
              <div>
                <Tooltip content="Choose the target platform architecture for the container image">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-help"
                  >
                    <option value="linux/amd64">linux/amd64</option>
                    <option value="linux/arm64">linux/arm64</option>
                  </select>
                </Tooltip>
              </div>
              <Button 
                onClick={handleFetchAttestations} 
                disabled={loading || !imageRef.trim()}
                className="flex items-center gap-2 min-w-[100px]"
                title={!imageRef.trim() ? "Enter an image reference first" : "Fetch attestations for this image"}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze
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

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="py-12">
              <LoadingSpinner 
                size="lg" 
                message="Fetching attestations and analyzing security..." 
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Welcome Screen */}
        {!data && !loading && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="py-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Supply Chain Security Analysis
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Enter a container image reference above to begin analyzing its security attestations, 
                  build provenance, and software bill of materials (SBOM).
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Visualize Dependencies</h3>
                    <p className="text-sm text-gray-600">
                      See how your software is built and what components it contains.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-3xl mb-2">🛡️</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Assess Security</h3>
                    <p className="text-sm text-gray-600">
                      Get security scores and identify potential vulnerabilities.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-3xl mb-2">📚</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Learn & Improve</h3>
                    <p className="text-sm text-gray-600">
                      Understand security concepts and get actionable recommendations.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Try an example:</strong> Click one of the sample images above to get started!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {data && !loading && (
          <ErrorBoundary>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <Tabs defaultValue="graph" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="graph" className="flex items-center gap-2">
                      📊 Graph
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-2">
                      📋 Table
                    </TabsTrigger>
                    <TabsTrigger value="json" className="flex items-center gap-2">
                      🔍 JSON
                    </TabsTrigger>
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

              <div className="xl:col-span-1">
                <div className="sticky top-6">
                  <ErrorBoundary>
                    <Legend />
                  </ErrorBoundary>
                </div>
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
        graphData={data}
      />

      {/* Guided Tour */}
      <GuidedTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}

// Security Overview Component
function SecurityOverview({ data }: { data: GraphPayload }) {
  const security = assessGraphSecurity(data);
  const trustBadge = getTrustLevelBadge(security.trustLevel);

  return (
    <Card className="w-64 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Trust Level */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Trust Level</span>
          <div
            className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{
              backgroundColor: trustBadge.bgColor,
              color: trustBadge.textColor
            }}
          >
            <span className="text-xs">{trustBadge.icon}</span>
            {trustBadge.label}
          </div>
        </div>

        {/* Security Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Security Score</span>
            <span className="text-xs font-bold">{security.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${security.score}%`,
                backgroundColor: security.score >= 80 ? '#16a34a' : security.score >= 60 ? '#eab308' : '#dc2626'
              }}
            />
          </div>
        </div>

        {/* Issues Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Issues Found</span>
          <div className="flex items-center gap-1">
            {security.issues.length === 0 ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
            <span className="text-xs font-medium">
              {security.issues.length}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1 text-center pt-2 border-t border-gray-200">
          <div>
            <div className="text-xs font-bold text-purple-600">{data.nodes.filter(n => n.type === 'IMAGE').length}</div>
            <div className="text-xs text-gray-500">Images</div>
          </div>
          <div>
            <div className="text-xs font-bold text-orange-600">{data.nodes.filter(n => n.type === 'SBOM_JSON').length}</div>
            <div className="text-xs text-gray-500">SBOMs</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-600">{data.nodes.filter(n => n.type === 'PROVENANCE').length}</div>
            <div className="text-xs text-gray-500">Provenance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
