// Field types supported: used by FormBuilder, rendering, and extraction schema
export const FIELD_TYPES = [
  { value: 'text', label: 'Single-line text' },
  { value: 'textarea', label: 'Multi-line text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
];

export const createField = (overrides = {}) => ({
  id: crypto.randomUUID(),
  label: '',
  type: 'text',
  required: false,
  options: [], // used only for dropdown
  ...overrides,
});

export const SCHEMA_PRESETS = [
  {
    id: 'invoice',
    name: 'Invoice / Receipt',
    description: 'Extract vendor, dates, totals, and payment status',
    fields: [
      { label: 'Vendor Name', type: 'text', required: true, options: [] },
      { label: 'Invoice Number', type: 'text', required: true, options: [] },
      { label: 'Invoice Date', type: 'date', required: true, options: [] },
      { label: 'Due Date', type: 'date', required: false, options: [] },
      { label: 'Total Amount', type: 'number', required: true, options: [] },
      { label: 'Tax Amount', type: 'number', required: false, options: [] },
      { label: 'Payment Status', type: 'dropdown', required: true, options: ['Paid', 'Pending', 'Due on Receipt', 'Overdue'] },
      { label: 'Summary or Line Notes', type: 'textarea', required: false, options: [] },
    ],
  },
  {
    id: 'candidate',
    name: 'Job Candidate Profile',
    description: 'Extract resume info, experience, and contact data',
    fields: [
      { label: 'Candidate Full Name', type: 'text', required: true, options: [] },
      { label: 'Email Address', type: 'text', required: true, options: [] },
      { label: 'Phone Number', type: 'text', required: false, options: [] },
      { label: 'Target Department', type: 'dropdown', required: true, options: ['Engineering', 'Product', 'Design', 'Operations', 'Sales'] },
      { label: 'Years of Experience', type: 'number', required: true, options: [] },
      { label: 'Available Start Date', type: 'date', required: false, options: [] },
      { label: 'Work Authorization Verified', type: 'checkbox', required: false, options: [] },
      { label: 'Professional Summary', type: 'textarea', required: false, options: [] },
    ],
  },
  {
    id: 'medical',
    name: 'Patient Intake Record',
    description: 'Extract patient identifiers, vitals, and insurance details',
    fields: [
      { label: 'Patient Name', type: 'text', required: true, options: [] },
      { label: 'Date of Birth', type: 'date', required: true, options: [] },
      { label: 'Primary Phone', type: 'text', required: true, options: [] },
      { label: 'Insurance Provider', type: 'text', required: false, options: [] },
      { label: 'Policy ID', type: 'text', required: false, options: [] },
      { label: 'Emergency Contact Consent', type: 'checkbox', required: true, options: [] },
      { label: 'Known Allergies and Medical History', type: 'textarea', required: false, options: [] },
    ],
  },
];