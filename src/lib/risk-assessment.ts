import type { NodeType, GraphPayload, ClNode } from './types';
import { assessGraphVulnerabilities, type VulnerabilityAssessment } from './cve-service';

export type TrustLevel = 'verified' | 'partial' | 'untrusted' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAssessment {
  trustLevel: TrustLevel;
  riskLevel: RiskLevel;
  score: number; // 0-100, higher is better
  issues: SecurityIssue[];
  recommendations: string[];
  vulnerabilityAssessment?: VulnerabilityAssessment;
}

export interface SecurityIssue {
  type: 'missing_attestation' | 'unsigned_component' | 'outdated_dependency' | 'vulnerability' | 'license_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  component?: string;
}

// Trust level colors and indicators
export const TRUST_LEVEL_STYLES = {
  verified: {
    color: '#16a34a', // green
    bgColor: '#dcfce7',
    textColor: '#166534',
    icon: '✅',
    label: 'Verified'
  },
  partial: {
    color: '#eab308', // yellow
    bgColor: '#fef3c7',
    textColor: '#92400e',
    icon: '⚠️',
    label: 'Partially Trusted'
  },
  untrusted: {
    color: '#dc2626', // red
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    icon: '❌',
    label: 'Untrusted'
  },
  unknown: {
    color: '#6b7280', // gray
    bgColor: '#f3f4f6',
    textColor: '#374151',
    icon: '❓',
    label: 'Unknown'
  }
};

export const RISK_LEVEL_STYLES = {
  low: {
    color: '#16a34a',
    bgColor: '#dcfce7',
    textColor: '#166534',
    label: 'Low Risk'
  },
  medium: {
    color: '#eab308',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    label: 'Medium Risk'
  },
  high: {
    color: '#f97316',
    bgColor: '#fed7aa',
    textColor: '#c2410c',
    label: 'High Risk'
  },
  critical: {
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    label: 'Critical Risk'
  }
};

/**
 * Assess the security posture of a graph payload
 */
export async function assessGraphSecurity(data: GraphPayload): Promise<SecurityAssessment> {
  const issues: SecurityIssue[] = [];
  let totalScore = 100;

  // Check for missing critical attestations
  const hasProvenance = data.nodes.some(n => n.type === 'PROVENANCE');
  const hasSBOM = data.nodes.some(n => n.type === 'SBOM_JSON');
  
  if (!hasProvenance) {
    issues.push({
      type: 'missing_attestation',
      severity: 'high',
      description: 'No SLSA provenance attestation found. This means the build process cannot be verified.',
      component: 'Build Process'
    });
    totalScore -= 30;
  }

  if (!hasSBOM) {
    issues.push({
      type: 'missing_attestation',
      severity: 'medium',
      description: 'No SBOM (Software Bill of Materials) found. Component inventory is unknown.',
      component: 'Dependencies'
    });
    totalScore -= 20;
  }

  // Assess vulnerabilities if SBOM is available
  let vulnerabilityAssessment: VulnerabilityAssessment | undefined;
  if (hasSBOM) {
    try {
      vulnerabilityAssessment = await assessGraphVulnerabilities(data);
      
      // Add vulnerability issues
      if (vulnerabilityAssessment.criticalCount > 0) {
        issues.push({
          type: 'vulnerability',
          severity: 'critical',
          description: `${vulnerabilityAssessment.criticalCount} critical vulnerabilities found in dependencies.`,
          component: 'Dependencies'
        });
        totalScore -= 40;
      }
      
      if (vulnerabilityAssessment.highCount > 0) {
        issues.push({
          type: 'vulnerability',
          severity: 'high',
          description: `${vulnerabilityAssessment.highCount} high-severity vulnerabilities found in dependencies.`,
          component: 'Dependencies'
        });
        totalScore -= Math.min(25, vulnerabilityAssessment.highCount * 5);
      }
      
      if (vulnerabilityAssessment.mediumCount > 3) {
        issues.push({
          type: 'vulnerability',
          severity: 'medium',
          description: `${vulnerabilityAssessment.mediumCount} medium-severity vulnerabilities found in dependencies.`,
          component: 'Dependencies'
        });
        totalScore -= Math.min(15, vulnerabilityAssessment.mediumCount * 2);
      }
      
      // Factor in overall vulnerability risk
      totalScore -= Math.round((vulnerabilityAssessment.overallRiskScore / 100) * 20);
      
    } catch (error) {
      console.warn('Failed to assess vulnerabilities:', error);
    }
  }

  // Assess individual nodes
  data.nodes.forEach(node => {
    const nodeAssessment = assessNodeSecurity(node, data);
    issues.push(...nodeAssessment.issues);
    totalScore = Math.min(totalScore, totalScore - (100 - nodeAssessment.score) / data.nodes.length);
  });

  // Determine overall trust and risk levels
  const trustLevel = determineTrustLevel(issues, hasProvenance, hasSBOM, vulnerabilityAssessment);
  const riskLevel = determineRiskLevel(issues, totalScore, vulnerabilityAssessment);

  const recommendations = generateRecommendations(issues, data, vulnerabilityAssessment);

  return {
    trustLevel,
    riskLevel,
    score: Math.max(0, Math.round(totalScore)),
    issues,
    recommendations,
    vulnerabilityAssessment
  };
}

/**
 * Assess the security of an individual node
 */
export function assessNodeSecurity(node: ClNode, graphData: GraphPayload): SecurityAssessment {
  const issues: SecurityIssue[] = [];
  let score = 100;

  // Node-specific assessments
  switch (node.type) {
    case 'IMAGE':
      // Check if image has attestations
      const hasAttestations = graphData.edges.some(e => e.from === node.id);
      if (!hasAttestations) {
        issues.push({
          type: 'unsigned_component',
          severity: 'high',
          description: 'Container image has no attestations or signatures.',
          component: node.name
        });
        score -= 40;
      }
      break;

    case 'PROVENANCE':
      // Check provenance completeness
      if (!node.meta || !node.meta.materials || node.meta.materials.length === 0) {
        issues.push({
          type: 'missing_attestation',
          severity: 'medium',
          description: 'Provenance attestation lacks detailed material information.',
          component: node.name
        });
        score -= 20;
      }
      break;

    case 'SBOM_JSON':
      // Basic SBOM validation
      if (!node.meta || !node.meta.packages) {
        issues.push({
          type: 'missing_attestation',
          severity: 'medium',
          description: 'SBOM appears incomplete or malformed.',
          component: node.name
        });
        score -= 25;
      }
      break;

    case 'GIT_HEAD_COMMIT':
      // Check for public repositories (basic heuristic)
      if (node.uri && !node.uri.includes('github.com') && !node.uri.includes('gitlab.com')) {
        issues.push({
          type: 'unsigned_component',
          severity: 'low',
          description: 'Source code from unknown or private repository.',
          component: node.name
        });
        score -= 10;
      }
      break;
  }

  const trustLevel = score > 80 ? 'verified' : score > 60 ? 'partial' : score > 30 ? 'untrusted' : 'unknown';
  const riskLevel = score > 80 ? 'low' : score > 60 ? 'medium' : score > 30 ? 'high' : 'critical';

  return {
    trustLevel,
    riskLevel,
    score: Math.max(0, score),
    issues,
    recommendations: generateNodeRecommendations(node, issues)
  };
}

/**
 * Determine overall trust level based on issues and attestations
 */
function determineTrustLevel(
  issues: SecurityIssue[], 
  hasProvenance: boolean, 
  hasSBOM: boolean, 
  vulnAssessment?: VulnerabilityAssessment
): TrustLevel {
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;

  // Critical vulnerabilities automatically make component untrusted
  if (vulnAssessment && vulnAssessment.criticalCount > 0) return 'untrusted';
  
  if (criticalIssues > 0) return 'untrusted';
  
  // High-risk vulnerabilities reduce trust
  if (vulnAssessment && vulnAssessment.highCount > 3) return 'untrusted';
  if (highIssues > 2) return 'untrusted';
  
  if (!hasProvenance && !hasSBOM) return 'untrusted';
  
  // Verified requires both attestations and no critical/high vulnerabilities
  if (hasProvenance && hasSBOM && highIssues === 0 && 
      (!vulnAssessment || vulnAssessment.criticalCount === 0 && vulnAssessment.highCount === 0)) {
    return 'verified';
  }
  
  // Partial trust if we have some attestations and limited vulnerabilities
  if ((hasProvenance || hasSBOM) && highIssues <= 1 &&
      (!vulnAssessment || vulnAssessment.criticalCount === 0)) {
    return 'partial';
  }
  
  return 'unknown';
}

/**
 * Determine risk level based on issues and score
 */
function determineRiskLevel(
  issues: SecurityIssue[], 
  score: number, 
  vulnAssessment?: VulnerabilityAssessment
): RiskLevel {
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;

  // Critical vulnerabilities or very low score = critical risk
  if (criticalIssues > 0 || score < 30 || 
      (vulnAssessment && vulnAssessment.criticalCount > 0)) {
    return 'critical';
  }
  
  // High vulnerabilities or low score = high risk
  if (highIssues > 1 || score < 50 || 
      (vulnAssessment && (vulnAssessment.highCount > 2 || vulnAssessment.overallRiskScore > 75))) {
    return 'high';
  }
  
  // Some issues or medium score = medium risk
  if (highIssues > 0 || score < 80 || 
      (vulnAssessment && (vulnAssessment.highCount > 0 || vulnAssessment.mediumCount > 5))) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  issues: SecurityIssue[], 
  data: GraphPayload, 
  vulnAssessment?: VulnerabilityAssessment
): string[] {
  const recommendations: string[] = [];

  // Vulnerability-specific recommendations (highest priority)
  if (vulnAssessment && vulnAssessment.recommendedActions.length > 0) {
    recommendations.push(...vulnAssessment.recommendedActions);
  }

  // Missing attestation recommendations
  if (!data.nodes.some(n => n.type === 'PROVENANCE')) {
    recommendations.push('Implement SLSA provenance in your build process to verify software origins.');
  }

  if (!data.nodes.some(n => n.type === 'SBOM_JSON')) {
    recommendations.push('Generate and attach SBOMs to track all software components and dependencies.');
  }

  // Issue-specific recommendations
  const issueTypes = new Set(issues.map(i => i.type));
  
  if (issueTypes.has('unsigned_component')) {
    recommendations.push('Sign all software artifacts and verify signatures before deployment.');
  }

  if (issueTypes.has('vulnerability') && !vulnAssessment) {
    recommendations.push('Scan for vulnerabilities regularly and prioritize fixing critical/high severity issues.');
  }

  if (issueTypes.has('outdated_dependency')) {
    recommendations.push('Keep dependencies updated and monitor for security updates.');
  }

  // Security best practices
  if (vulnAssessment && vulnAssessment.totalVulnerabilities > 0) {
    recommendations.push('Implement automated vulnerability scanning in your CI/CD pipeline.');
    recommendations.push('Set up security alerts for new vulnerabilities in your dependencies.');
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push('Continue following security best practices and monitor for new vulnerabilities.');
    recommendations.push('Consider implementing additional security measures like dependency pinning.');
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}

/**
 * Generate node-specific recommendations
 */
function generateNodeRecommendations(node: ClNode, issues: SecurityIssue[]): string[] {
  const recommendations: string[] = [];

  switch (node.type) {
    case 'IMAGE':
      recommendations.push('Scan container image for vulnerabilities before deployment.');
      recommendations.push('Use minimal base images to reduce attack surface.');
      break;
    case 'PROVENANCE':
      recommendations.push('Verify the build environment and source integrity.');
      break;
    case 'SBOM_JSON':
      recommendations.push('Review all components for known vulnerabilities.');
      recommendations.push('Ensure all licenses are compatible with your usage.');
      break;
    case 'GIT_HEAD_COMMIT':
      recommendations.push('Verify the commit signature and author identity.');
      break;
  }

  return recommendations;
}

/**
 * Get trust level badge properties
 */
export function getTrustLevelBadge(trustLevel: TrustLevel) {
  return TRUST_LEVEL_STYLES[trustLevel];
}

/**
 * Get risk level badge properties  
 */
export function getRiskLevelBadge(riskLevel: RiskLevel) {
  return RISK_LEVEL_STYLES[riskLevel];
}
