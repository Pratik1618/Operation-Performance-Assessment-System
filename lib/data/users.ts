// OCRMS User Data
export const currentUser = {
  id: 'USR_OE1',
  name: 'Ravi Shankar',
  code: 'OE-001',
  designation: 'Operation Executive',
  role: 'oe' as const,
  region: 'North',
  state: 'Haryana',
  zone: 'NCR',
  email: 'ravi.shankar@opas.com',
  phone: '+91 9876543210',
}

export const employees = [
  { id: 'USR_RM1', name: 'Suresh Kumar', code: 'RM-001', designation: 'Regional Manager', role: 'rm' as const, region: 'North', state: 'Delhi', zone: 'NCR', email: 'suresh.kumar@opas.com', phone: '+91 9876543211' },
  { id: 'USR_AVP1', name: 'Venkat Raman', code: 'AVP-001', designation: 'AVP Operations', role: 'avp' as const, region: 'North', state: 'Delhi', zone: 'NCR', email: 'venkat.raman@opas.com', phone: '+91 9876543212' },
  { id: 'USR_BH1', name: 'Priya Saxena', code: 'BH-001', designation: 'Business Head', role: 'bh' as const, region: 'All', state: 'All', zone: 'All', email: 'priya.saxena@opas.com', phone: '+91 9876543213' },
  { id: 'USR_HR1', name: 'Neha Verma', code: 'HR-001', designation: 'HR Manager', role: 'hr' as const, region: 'All', state: 'All', zone: 'All', email: 'neha.verma@opas.com', phone: '+91 9876543214' },
  { id: 'USR_PROC1', name: 'Amit Sharma', code: 'PROC-001', designation: 'Procurement Head', role: 'procurement' as const, region: 'All', state: 'All', zone: 'All', email: 'amit.sharma@opas.com', phone: '+91 9876543215' },
]
