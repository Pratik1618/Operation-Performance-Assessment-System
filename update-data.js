import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'activities_mapping.csv');
const tsPath = path.join(process.cwd(), 'lib/data/ocrms-data.ts');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(l => l.trim() !== '');
const headers = lines[0].split(',');

const mapping = {};

for (let i = 1; i < lines.length; i++) {
  // Parse CSV line handling quotes
  const row = [];
  let inQuotes = false;
  let currentToken = '';
  for (let char of lines[i]) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  row.push(currentToken.trim());

  if (row.length < 6) continue;

  const code = row[0];
  const name = row[1];
  const assignedRoles = row[4].toLowerCase();
  const flowText = row[5];
  
  // Convert flowText (e.g. 'OE ? RM ? AVP ? BH ? DR' or 'OE ? RM; HRBP ? HR DR') to array
  // We only care about the main flow before the semicolon if any, because the UI relies on the array.
  // Actually, wait, some flows are 'OE ? RM ? AVP ? BH; HRBP ? HR DR'. 
  // Let's just extract the main flow.
  const mainFlowPart = flowText.split(';')[0];
  const flowArray = mainFlowPart.split('?').map(s => s.trim().toLowerCase());
  
  // Format flowText properly replacing ? with →
  const formattedFlowText = flowText.replace(/\?/g, '→').replace(/ +/g, ' ').replace(/ → /g, ' → ');

  mapping[code] = {
    assignedRoles,
    approvalFlow: flowArray,
    approvalFlowText: formattedFlowText,
    name
  };
}

let tsContent = fs.readFileSync(tsPath, 'utf8');

for (const code of Object.keys(mapping)) {
  const data = mapping[code];
  const regex = new RegExp(`(code:\\s*'${code}',[\\s\\S]*?approvalFlow:\\s*\\[).*?(\\],[\\s\\S]*?assignedRoles:\\s*')[^']*(',[\\s\\S]*?approvalFlowText:\\s*')[^']*(')`, 'g');
  
  const replacementArray = data.approvalFlow.map(r => `'${r}'`).join(', ');
  
  tsContent = tsContent.replace(regex, (match, p1, p2, p3, p4) => {
    return `${p1}${replacementArray}${p2}${data.assignedRoles}${p3}${data.approvalFlowText}${p4}`;
  });
}

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Done mapping existing fields.');
