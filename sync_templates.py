import csv
import os
import re

csv_path = r"d:\pratik\operations-performance-ui (1)\activities_mapping.csv"
data_path = r"d:\pratik\operations-performance-ui (1)\lib\data\ocrms-data.ts"

def sync():
    if not os.path.exists(csv_path):
        print(f"CSV path not found: {csv_path}")
        return
    if not os.path.exists(data_path):
        print(f"Data path not found: {data_path}")
        return

    # 1. Parse CSV mapping
    mappings = {}
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader) # skip header
        for row in reader:
            if not row or len(row) < 7:
                continue
            code = row[0].strip()
            name = row[1].strip()
            category = row[2].strip()
            frequency = row[3].strip()
            roles = row[4].strip()
            flow = row[5].strip().replace('?', '→').replace('  ', ' ')
            weight = row[6].strip()
            
            mappings[code] = {
                "category": category,
                "roles": roles,
                "flow": flow,
                "weight": weight
            }

    # 2. Read ocrms-data.ts
    with open(data_path, mode='r', encoding='utf-8') as f:
        content = f.read()

    # 3. Synchronize block by block
    updated_count = 0
    for code, info in mappings.items():
        code_str = f"code: '{code}'"
        code_pos = content.find(code_str)
        if code_pos == -1:
            print(f"Code {code} not found in ocrms-data.ts")
            continue

        # Find opening brace '{' before code
        open_pos = None
        for i in range(code_pos, -1, -1):
            if content[i] == '{':
                open_pos = i
                break
        
        if open_pos is None:
            print(f"Opening brace not found for code {code}")
            continue

        # Find matching closing brace '}'
        brace_count = 1
        close_pos = None
        for i in range(open_pos + 1, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    close_pos = i
                    break

        if close_pos is None:
            print(f"Closing brace not found for code {code}")
            continue

        # Extract block
        block = content[open_pos:close_pos+1]
        
        # Replace weightage
        block = re.sub(r"weightage:\s*\d+", f"weightage: {info['weight']}", block)
        
        # Replace category
        block = re.sub(r"category:\s*'[^']+'", f"category: '{info['category']}'", block)

        # Add or update assignedRoles and approvalFlowText
        block = re.sub(r"\s*assignedRoles:\s*'[^']+',?", "", block)
        block = re.sub(r"\s*approvalFlowText:\s*'[^']+',?", "", block)
        
        # Insert them right before the closing brace '}'
        fields_to_add = f"\n    assignedRoles: '{info['roles']}',\n    approvalFlowText: '{info['flow']}',\n  }}"
        block = block[:-3] + fields_to_add

        # Replace in original content
        content = content[:open_pos] + block + content[close_pos+1:]
        updated_count += 1

    # 4. Save updated file
    with open(data_path, mode='w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Successfully synchronized {updated_count} activity templates in ocrms-data.ts!")

if __name__ == "__main__":
    sync()
