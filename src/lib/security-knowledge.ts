// Security knowledge base for educational tooltips and explanations

export interface SecurityConcept {
  id: string;
  term: string;
  shortDescription: string;
  detailedDescription: string;
  businessImpact: string;
  actionableAdvice?: string;
  relatedConcepts?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  learnMoreUrls?: string[];
}

export const SECURITY_GLOSSARY: Record<string, SecurityConcept> = {
  // Attestation Types
  'slsa-provenance': {
    id: 'slsa-provenance',
    term: 'SLSA Provenance',
    shortDescription: 'A record of how your software was built, providing transparency into the build process.',
    detailedDescription: 'SLSA (Supply-chain Levels for Software Artifacts) provenance contains metadata about how a software artifact was built, including the source code, build system, and build environment. This creates an auditable trail from source to binary.',
    businessImpact: 'Helps prevent supply chain attacks by ensuring you know exactly how your software was built and can verify its authenticity.',
    actionableAdvice: 'Look for builds from trusted repositories with verified identities. Missing provenance may indicate a security risk.',
    relatedConcepts: ['slsa-levels', 'build-security', 'supply-chain-security'],
    riskLevel: 'high',
    learnMoreUrls: ['https://slsa.dev/provenance/']
  },
  
  'sbom': {
    id: 'sbom',
    term: 'Software Bill of Materials (SBOM)',
    shortDescription: 'A complete inventory of all components, libraries, and dependencies in your software.',
    detailedDescription: 'An SBOM is like an ingredient list for software, showing every component that went into building your application. This includes direct dependencies, transitive dependencies, and their versions and licenses.',
    businessImpact: 'Critical for vulnerability management, license compliance, and incident response. Required by many regulations and security frameworks.',
    actionableAdvice: 'Regularly scan SBOMs for vulnerabilities and outdated components. Ensure all dependencies have known licenses.',
    relatedConcepts: ['vulnerabilities', 'licenses', 'dependency-management'],
    riskLevel: 'high',
    learnMoreUrls: ['https://www.ntia.gov/SBOM']
  },

  'apko-config': {
    id: 'apko-config',
    term: 'APKO Configuration',
    shortDescription: 'A declarative way to build secure, minimal container images.',
    detailedDescription: 'APKO builds container images from APK packages without requiring a Dockerfile. It creates minimal, distroless images with only the necessary components, reducing the attack surface.',
    businessImpact: 'Reduces security vulnerabilities by minimizing the container footprint and providing reproducible builds.',
    actionableAdvice: 'Review the package list for unnecessary components. Minimal images are more secure.',
    relatedConcepts: ['container-security', 'minimal-images', 'reproducible-builds'],
    riskLevel: 'low',
    learnMoreUrls: ['https://github.com/chainguard-dev/apko']
  },

  // Node Types
  'attestation-node': {
    id: 'attestation-node',
    term: 'Attestation',
    shortDescription: 'A cryptographically signed statement about software properties.',
    detailedDescription: 'Attestations are signed metadata statements that make verifiable claims about software artifacts. They provide cryptographic proof about how software was built, what it contains, or other security properties.',
    businessImpact: 'Enables zero-trust software supply chain security by providing verifiable evidence about software provenance.',
    actionableAdvice: 'Always verify attestation signatures. Unsigned or unverified attestations provide no security guarantees.',
    relatedConcepts: ['digital-signatures', 'provenance', 'verification'],
    riskLevel: 'critical',
    learnMoreUrls: ['https://docs.sigstore.dev/']
  },

  'container-image': {
    id: 'container-image',
    term: 'Container Image',
    shortDescription: 'A packaged application with all its dependencies.',
    detailedDescription: 'Container images bundle your application code with its runtime, libraries, and system dependencies into a single, portable unit that can run consistently across different environments.',
    businessImpact: 'Ensures application consistency but can introduce security risks if not properly managed and scanned.',
    actionableAdvice: 'Regularly scan images for vulnerabilities, use minimal base images, and keep them updated.',
    relatedConcepts: ['vulnerability-scanning', 'base-images', 'container-security'],
    riskLevel: 'medium',
    learnMoreUrls: ['https://docs.docker.com/get-started/overview/']
  },

  // Security Concepts
  'supply-chain-attack': {
    id: 'supply-chain-attack',
    term: 'Supply Chain Attack',
    shortDescription: 'An attack that compromises software through its dependencies or build process.',
    detailedDescription: 'Supply chain attacks target the software development and distribution process rather than the end product directly. Attackers compromise dependencies, build tools, or distribution systems to inject malicious code.',
    businessImpact: 'Can affect thousands of applications through a single compromised dependency. Often difficult to detect and can have widespread impact.',
    actionableAdvice: 'Use attestations, verify signatures, monitor dependencies, and implement defense-in-depth strategies.',
    relatedConcepts: ['dependency-confusion', 'build-security', 'provenance'],
    riskLevel: 'critical',
    learnMoreUrls: ['https://www.cisa.gov/supply-chain-attacks']
  },

  'trust-level': {
    id: 'trust-level',
    term: 'Trust Level',
    shortDescription: 'How much confidence you can have in software based on its verification status.',
    detailedDescription: 'Trust level indicates the degree to which software has been verified through attestations, signatures, and other security measures. Higher trust levels mean more security guarantees.',
    businessImpact: 'Helps prioritize security efforts and make informed decisions about software risk.',
    actionableAdvice: 'Prefer software with higher trust levels. Investigate and remediate low-trust components.',
    relatedConcepts: ['verification', 'attestations', 'risk-assessment'],
    riskLevel: 'high',
    learnMoreUrls: []
  },

  // Risk and Compliance
  'vulnerability': {
    id: 'vulnerability',
    term: 'Security Vulnerability',
    shortDescription: 'A weakness in software that can be exploited by attackers.',
    detailedDescription: 'Security vulnerabilities are flaws in software design, implementation, or configuration that can be exploited to compromise security. They are tracked with CVE identifiers and scored with CVSS.',
    businessImpact: 'Can lead to data breaches, system compromise, and business disruption. Legal and regulatory implications.',
    actionableAdvice: 'Prioritize fixing critical and high-severity vulnerabilities. Keep dependencies updated and monitor for new vulnerabilities.',
    relatedConcepts: ['cvss-score', 'patch-management', 'vulnerability-scanning'],
    riskLevel: 'critical',
    learnMoreUrls: ['https://cve.mitre.org/']
  },

  'slsa-levels': {
    id: 'slsa-levels',
    term: 'SLSA Levels',
    shortDescription: 'A framework measuring build security maturity from 0 to 3.',
    detailedDescription: 'SLSA defines four levels (0-3) that measure the integrity guarantees of software build processes. Higher levels provide stronger security assurances through better provenance and build environment controls.',
    businessImpact: 'Higher SLSA levels reduce supply chain risk and may be required for compliance or customer requirements.',
    actionableAdvice: 'Work towards achieving higher SLSA levels by improving build security practices and implementing provenance.',
    relatedConcepts: ['build-security', 'provenance', 'compliance'],
    riskLevel: 'medium',
    learnMoreUrls: ['https://slsa.dev/levels']
  }
};

// Helper functions for educational context
export function getConceptByNodeType(nodeType: string): SecurityConcept | undefined {
  const mapping: Record<string, string> = {
    'PROVENANCE': 'slsa-provenance',
    'SBOM_JSON': 'sbom',
    'APKO_CONFIG': 'apko-config',
    'ATTESTATION': 'attestation-node',
    'IMAGE': 'container-image'
  };
  
  const conceptId = mapping[nodeType];
  return conceptId ? SECURITY_GLOSSARY[conceptId] : undefined;
}

export function getSecurityAdviceForNodeType(nodeType: string): string {
  const concept = getConceptByNodeType(nodeType);
  return concept?.actionableAdvice || 'Review this component for security best practices.';
}

export function getRiskLevelForNodeType(nodeType: string): 'low' | 'medium' | 'high' | 'critical' {
  const concept = getConceptByNodeType(nodeType);
  return concept?.riskLevel || 'medium';
}

export function getBusinessImpactForNodeType(nodeType: string): string {
  const concept = getConceptByNodeType(nodeType);
  return concept?.businessImpact || 'This component may impact your application security.';
}
