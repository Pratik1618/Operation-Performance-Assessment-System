import fs from 'fs';
import path from 'path';

const tsPath = path.join(process.cwd(), 'lib/data/ocrms-data.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Step 1: Rename ACT-OPS-04 -> ACT-OPS-05, TPL-OPS-004 -> TPL-OPS-005
tsContent = tsContent.replace(/code: 'ACT-OPS-04'/g, "code: 'ACT-OPS-05'");
tsContent = tsContent.replace(/id: 'TPL-OPS-004'/g, "id: 'TPL-OPS-005'");

// Step 2: Rename ACT-OPS-03 -> ACT-OPS-04, TPL-OPS-003 -> TPL-OPS-004
tsContent = tsContent.replace(/code: 'ACT-OPS-03'/g, "code: 'ACT-OPS-04'");
tsContent = tsContent.replace(/id: 'TPL-OPS-003'/g, "id: 'TPL-OPS-004'");

// Step 3: Insert ACT-OPS-03 before ACT-OPS-04
const insertContent = `  {
    id: 'TPL-OPS-003',
    code: 'ACT-OPS-03',
    name: 'Final closing report of the queries(sitewise)',
    description: 'Final closing report of the queries sitewise after 7 days.',
    category: 'Site Operations',
    frequency: 'one-time',
    weightage: 5,
    evidenceTypes: ['pdf'],
    formSchema: [
      { id: 'reportFile', label: 'Upload Closing Report', type: 'checkbox', required: true }
    ],
    approvalFlow: ['oe', 'rm', 'avp', 'bh', 'dr'],
    active: true,
    assignedRoles: 'oe',
    approvalFlowText: 'OE → RM → AVP → BH → DR'
  },
`;

tsContent = tsContent.replace(
  /(\{\s*id:\s*'TPL-OPS-004')/,
  insertContent + '$1'
);

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Done inserting ACT-OPS-03 and shifting codes.');
