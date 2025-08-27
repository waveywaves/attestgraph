import { NextRequest, NextResponse } from 'next/server'; 
import { execFile } from 'node:child_process';
import { z } from 'zod';
import type { ClNode, ClEdge, NodeType } from '@/lib/types';

const COSIGN = 'cosign';
const MAX_BUFFER = 10 * 1024 * 1024; // 10MB
const TIMEOUT = 30000; // 30 seconds

// Input validation schema
const GraphRequestSchema = z.object({
  image: z.string().min(1, 'Image parameter is required').max(500, 'Image name too long'),
  platform: z.string().regex(/^linux\/(amd64|arm64|386|arm\/v[67]|ppc64le|s390x)$/, 'Invalid platform').optional().default('linux/amd64'),
});

// Allowlist for predicate types
const ALLOWED_PREDICATE_TYPES = [
  'https://slsa.dev/provenance/v1',
  'https://spdx.dev/Document',
  'https://apko.dev/image-configuration'
] as const;

const run = (args: string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    const childProcess = execFile(
      COSIGN, 
      args, 
      { 
        maxBuffer: MAX_BUFFER,
        timeout: TIMEOUT,
        env: { ...process.env, PATH: process.env.PATH },
      }, 
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`cosign error: ${stderr || error.message}`));
        } else {
          resolve(stdout);
        }
      }
    );
    
    // Handle timeout
    setTimeout(() => {
      childProcess.kill('SIGTERM');
      reject(new Error('cosign command timed out'));
    }, TIMEOUT);
  });

const downloadAttestation = async (image: string, platform: string, predicateType: string): Promise<string> => {
  if (!ALLOWED_PREDICATE_TYPES.includes(predicateType as any)) {
    throw new Error(`Invalid predicate type: ${predicateType}`);
  }
  
  return run([
    'download', 
    'attestation', 
    '--platform', platform, 
    '--predicate-type', predicateType, 
    image
  ]);
};

const decodeAttestations = (ndjson: string) => {
  if (!ndjson.trim()) return [];
  
  try {
    return ndjson
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const parsed = JSON.parse(line);
        if (!parsed.payload) {
          throw new Error('Missing payload in attestation');
        }
        return JSON.parse(Buffer.from(parsed.payload, 'base64').toString('utf-8'));
      });
  } catch (error) {
    console.error('Failed to decode attestations:', error);
    return [];
  }
};

export async function GET(req: NextRequest) { 
  try {
    const { searchParams } = new URL(req.url);
    
    // Validate input
    const validation = GraphRequestSchema.safeParse({
      image: searchParams.get('image'),
      platform: searchParams.get('platform'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { image, platform } = validation.data;

    // Log request for monitoring
    console.log(`Fetching attestations for ${image} (${platform})`);

    // Fetch attestations in parallel with error handling
    const [slsaRaw, sbomRaw, apkoRaw] = await Promise.allSettled([
      downloadAttestation(image, platform, 'https://slsa.dev/provenance/v1'),
      downloadAttestation(image, platform, 'https://spdx.dev/Document'),
      downloadAttestation(image, platform, 'https://apko.dev/image-configuration')
    ]);

    // Process results
    const slsa = slsaRaw.status === 'fulfilled' ? decodeAttestations(slsaRaw.value)[0] : null;
    const sbom = sbomRaw.status === 'fulfilled' ? decodeAttestations(sbomRaw.value)[0] : null;
    const apko = apkoRaw.status === 'fulfilled' ? decodeAttestations(apkoRaw.value)[0] : null;

    // Build graph data
    const nodes: ClNode[] = [];
    const edges: ClEdge[] = [];

    // Extract root image digest from any available attestation
    const subjectDigest = 
      slsa?.subject?.[0]?.digest?.sha256 || 
      sbom?.subject?.[0]?.digest?.sha256;
    
    if (!subjectDigest) {
      return NextResponse.json(
        { error: 'No valid attestations found for the specified image' },
        { status: 404 }
      );
    }

    const rootId = `sha256:${subjectDigest}`;
    nodes.push({
      id: rootId,
      type: 'IMAGE',
      name: image,
      digest: rootId,
    });

    // Process SLSA provenance
    if (slsa?.predicate) {
      const provenanceId = 'att-slsa';
      nodes.push({
        id: provenanceId,
        type: 'PROVENANCE',
        name: 'SLSA v1 Provenance',
        meta: slsa.predicate,
      });
      edges.push({
        id: 'e-root-slsa',
        from: rootId,
        to: provenanceId,
        label: 'attests',
      });

      // Process materials (build dependencies)
      const materials = slsa.predicate.materials || [];
      materials.forEach((material: any, index: number) => {
        const materialId = `mat-${index}`;
        const isGitRepo = /^git(\+|:|@)|^https?:\/\/(github|gitlab|bitbucket)/.test(material.uri || '');
        const nodeType: NodeType = isGitRepo ? 'GIT_HEAD_COMMIT' : 'MORE_REFERENCES';
        
        nodes.push({
          id: materialId,
          type: nodeType,
          name: material.uri || `Material ${index + 1}`,
          uri: material.uri,
          meta: material,
        });
        
        edges.push({
          id: `e-slsa-${index}`,
          from: provenanceId,
          to: materialId,
          label: 'built from',
        });
      });
    }

    // Process SBOM
    if (sbom?.predicate) {
      const sbomId = 'att-sbom';
      nodes.push({
        id: sbomId,
        type: 'SBOM_JSON',
        name: 'SBOM (SPDX)',
        meta: sbom.predicate,
      });
      edges.push({
        id: 'e-root-sbom',
        from: rootId,
        to: sbomId,
        label: 'describes',
      });
    }

    // Process APKO configuration
    if (apko?.predicate) {
      const apkoId = 'att-apko';
      nodes.push({
        id: apkoId,
        type: 'APKO_CONFIG',
        name: 'APKO Configuration',
        meta: apko.predicate,
      });
      edges.push({
        id: 'e-root-apko',
        from: rootId,
        to: apkoId,
        label: 'configured by',
      });
    }

    const response = {
      root: rootId,
      nodes,
      edges,
      raw: { slsa, sbom, apko },
      meta: {
        image,
        platform,
        timestamp: new Date().toISOString(),
        attestationCounts: {
          slsa: slsa ? 1 : 0,
          sbom: sbom ? 1 : 0,
          apko: apko ? 1 : 0,
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch attestations', 
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}