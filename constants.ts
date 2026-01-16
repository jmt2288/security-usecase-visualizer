import { UseCase } from './types';

export const MITRE_TACTICS_LIST = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
  
];

// Updated categories: Entra ID, XDR, Windows, Office 365
export const INITIAL_USE_CASES: UseCase[] = [
  {
    id: 'AO-ACC-001',
    description: 'Account created and deleted in a short period of time',
    tactics: ['Persistence', 'Defense Evasion'],
    techniques: ['T1136.003', 'T1078.004', 'T1070.009'],
    category: 'Entra ID'
  },
  {
    id: 'AO-ACC-002',
    description: 'Attempt to access from disabled accounts',
    tactics: ['Initial Access', 'Credential Access'],
    techniques: ['T1078.004', 'T1110'],
    category: 'Entra ID'
  },
  {
    id: 'AO-ACC-003',
    description: 'Impossible travel: Succesfull login from same user and different geolocation',
    tactics: ['Initial Access'],
    techniques: ['T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'AO-ACC-004',
    description: 'MFA denied by user after login attempt from suspicious geolocation',
    tactics: ['Credential Access', 'Initial Access'],
    techniques: ['T1621', 'T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'AO-ACC-005',
    description: 'Successful login from potentially dangerous countries',
    tactics: ['Initial Access'],
    techniques: ['T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'AO-ALL-001',
    description: 'Microsoft Threat Protection high severity detection',
    tactics: ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Exfiltration', 'Impact'],
    techniques: [],
    category: 'XDR'
  },
  {
    id: 'AO-ALL-002',
    description: 'Multiple detections in same host',
    tactics: ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Exfiltration', 'Impact'],
    techniques: [],
    category: 'XDR'
  },
  {
    id: 'AO-ALL-003',
    description: 'Same detection in multiple hosts',
    tactics: ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Exfiltration', 'Impact'],
    techniques: [],
    category: 'XDR'
  },
  {
    id: 'AO-BRU-001',
    description: 'Excessive login failures for same user followed by successful one',
    tactics: ['Initial Access', 'Credential Access'],
    techniques: ['T1110.001', 'T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'AO-CSC-001',
    description: 'URL Added to Application from Unknown Domain',
    tactics: ['Persistence', 'Credential Access', 'Privilege Escalation'],
    techniques: ['T1528', 'T1098.001'],
    category: 'Entra ID'
  },
  {
    id: 'AO-EVA-001',
    description: 'PIM Alert Disabled',
    tactics: ['Defense Evasion', 'Privilege Escalation'],
    techniques: ['T1562.001', 'T1098.001'],
    category: 'Entra ID'
  },
  {
    id: 'AO-EVA-002',
    description: 'Hostile clear audit logs',
    tactics: ['Defense Evasion'],
    techniques: ['T1070.001'],
    category: 'Windows'
  },
  {
    id: 'AO-EVA-003',
    description: 'Suspicious encoded command or obfuscation files',
    tactics: ['Execution', 'Defense Evasion'],
    techniques: ['T1059.001', 'T1027.010'],
    category: 'Windows'
  },
  {
    id: 'AO-EVA-004',
    description: 'Windows Defender Preferences Suspicious Changes',
    tactics: ['Defense Evasion'],
    techniques: ['T1562.001'],
    category: 'Windows'
  },
  {
    id: 'AO-EXF-001',
    description: 'Excessive file transfers',
    tactics: ['Exfiltration', 'Collection'],
    techniques: ['T1020', 'T1030', 'T1213.002'],
    category: 'Office 365'
  },
  {
    id: 'AO-EXF-002',
    description: 'Inbox forwarding rule external domain',
    tactics: ['Exfiltration', 'Collection'],
    techniques: ['T1114.003', 'T1020'],
    category: 'Office 365'
  },
  {
    id: 'AO-PER-001',
    description: 'Initial Credential Added to Application or Service Principal',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1098.001'],
    category: 'Entra ID'
  },
  {
    id: 'AO-PER-002',
    description: 'Suspicious registry activity',
    tactics: ['Persistence', 'Defense Evasion', 'Privilege Escalation'],
    techniques: ['T1112', 'T1547.001'],
    category: 'Windows'
  },
  {
    id: 'AO-PRI-001',
    description: 'Privileged role assigned to a user',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1098.003'],
    category: 'Entra ID'
  },
  {
    id: 'AO-PRI-002',
    description: 'Temporary elevated access outside working hours',
    tactics: ['Defense Evasion', 'Privilege Escalation'],
    techniques: ['T1548.005'],
    category: 'Entra ID'
  },
  {
    id: 'AO-PRI-003',
    description: 'Potential Privilege Escalation UAC bypass',
    tactics: ['Defense Evasion', 'Privilege Escalation'],
    techniques: ['T1548.002'],
    category: 'Windows'
  },
  {
    id: 'CC-SNC-001',
    description: 'Possible Malicious Download via Powershell',
    tactics: ['Execution', 'Command and Control'],
    techniques: ['T1105', 'T1059.001'],
    category: 'Windows'
  },
  {
    id: 'DE-EMA-001',
    description: 'Attached files with a suspicious extension',
    tactics: ['Initial Access', 'Execution'],
    techniques: ['T1566.001', 'T1204.002'],
    category: 'Office 365'
  },
  {
    id: 'DE-PHI-001',
    description: 'Possible inbound phishing',
    tactics: ['Initial Access'],
    techniques: ['T1566'],
    category: 'Office 365'
  },
  {
    id: 'EX-APP-001',
    description: 'Malware file upload',
    tactics: ['Lateral Movement', 'Execution'],
    techniques: ['T1570', 'T1204.002'],
    category: 'Office 365'
  },
  {
    id: 'EX-BRU-001',
    description: 'Password spraying activity',
    tactics: ['Credential Access'],
    techniques: ['T1110.003'],
    category: 'Entra ID'
  },
  {
    id: 'EX-BRU-002',
    description: 'High volume of accounts locked',
    tactics: ['Credential Access', 'Impact'],
    techniques: ['T1110.003', 'T1531'],
    category: 'Entra ID'
  },
  {
    id: 'PV-ACC-001',
    description: 'Attempt to disable MFA for a user',
    tactics: ['Defense Evasion', 'Credential Access', 'Persistence'],
    techniques: ['T1556.006'],
    category: 'Entra ID'
  },
  {
    id: 'PV-POL-001',
    description: 'Changes to PIM settings',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1098.003', 'T1548.005', 'T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'PV-POL-002',
    description: 'High volume of accounts deleted/disabled',
    tactics: ['Impact', 'Defense Evasion'],
    techniques: ['T1564', 'T1531', 'T1078.004'],
    category: 'Entra ID'
  },
  {
    id: 'PV-POL-003',
    description: 'Microsoft 365 Exchange Security Modification',
    tactics: ['Defense Evasion', 'Impact'],
    techniques: ['T1562', 'T1489', 'T1562.001'],
    category: 'Office 365'
  },
  {
    id: 'PV-PRV-001',
    description: 'Possible Masquerading',
    tactics: ['Defense Evasion'],
    techniques: ['T1036.005'],
    category: 'Windows'
  },
  {
    id: 'RE-FIP-001',
    description: 'Suspicious UserAgent',
    tactics: ['Reconnaissance', 'Initial Access'],
    techniques: ['T1190', 'T1595.002', 'T1595.003'],
    category: 'Entra ID'
  },
  {
    id: 'RE-FIP-002',
    description: 'Suspicious UserAgent',
    tactics: ['Reconnaissance', 'Initial Access'],
    techniques: ['T1190', 'T1595.002', 'T1595.003'],
    category: 'Office 365'
  }
];

// Adjusted colors to be slightly darker/richer for better contrast on Light Background
export const TACTIC_COLORS: Record<string, string> = {
  'Initial Access': '#0284c7', // Sky 600
  'Execution': '#db2777', // Pink 600
  'Persistence': '#d97706', // Amber 600
  'Privilege Escalation': '#dc2626', // Red 600
  'Defense Evasion': '#7c3aed', // Violet 600
  'Credential Access': '#ea580c', // Orange 600
  'Discovery': '#65a30d', // Lime 600
  'Lateral Movement': '#0d9488', // Teal 600
  'Collection': '#0891b2', // Cyan 600
  'Exfiltration': '#059669', // Emerald 600
  'Command and Control': '#2563eb', // Blue 600
  'Impact': '#b91c1c', // Red 700
  'Reconnaissance': '#4b5563', // Gray 600
  'Resource Development': '#9333ea', // Purple 600
  'All': '#475569', // Slate 600
};