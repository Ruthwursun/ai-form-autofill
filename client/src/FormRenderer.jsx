import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MinusCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function FormRenderer({ fields, values, setValues, meta = {} }) {
  const handleChange = (id, value) => setValues({ ...values, [id]: value });

  if (fields.length === 0) {
    return (
      <div className="border border-slate-200/80 bg-slate-50/40 rounded-2xl p-10 text-center shadow-studio-card">
        <div className="h-12 w-12 rounded-xl bg-white text-slate-400 mx-auto flex items-center justify-center mb-3 border border-slate-200/80 shadow-2xs">
          <FileSpreadsheet size={22} strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Live Form Preview</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          As you build your schema or load a template, your interactive form fields will appear here for review and autofill.
        </p>
      </div>
    );
  }

  // Calculate extraction statistics if metadata is present
  const metaKeys = Object.keys(meta);
  const hasExtracted = metaKeys.length > 0;
  const foundCount = fields.filter((f) => meta[f.id]?.found).length;
  const highConfCount = fields.filter((f) => meta[f.id]?.confidence === 'high').length;
  const missingCount = fields.filter((f) => f.required && !values[f.id]).length;

  return (
    <div className="space-y-4">
      {/* Extraction Results Status Summary Banner */}
      {hasExtracted && (
        <div className="rounded-xl bg-slate-50/70 border border-slate-200/80 p-3 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Extraction Summary</span>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {foundCount} of {fields.length} matched
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matched</div>
              <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{foundCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Conf.</div>
              <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">{highConfCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Missing Req.</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${missingCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {missingCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-3">
        {fields.map((field) => {
          const value = values[field.id] ?? '';
          const fieldMeta = meta[field.id]; // { found, confidence } after extraction
          const isEmpty = value === '' || value === null || value === undefined;
          const flagged = field.required && isEmpty && fieldMeta; // only flag after extraction attempt

          return (
            <div
              key={field.id}
              className={`rounded-xl p-3.5 transition-all duration-200 ${
                flagged
                  ? 'bg-red-50/40 border border-red-200/90 shadow-studio-card'
                  : fieldMeta?.found
                  ? 'bg-white border border-slate-200/90 shadow-studio-card hover:border-slate-300 hover:shadow-studio-elevated'
                  : 'bg-white border border-slate-200/90 shadow-studio-card hover:border-slate-300 hover:shadow-studio-elevated'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor={`input-${field.id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 select-none cursor-pointer"
                >
                  <span>{field.label || <span className="italic text-slate-400 font-normal">Untitled field</span>}</span>
                  {field.required && (
                    <span className="text-red-500 font-bold" title="Required field">
                      *
                    </span>
                  )}
                </label>

                {/* Extraction Metadata Badge */}
                {fieldMeta && (
                  <div>
                    {fieldMeta.found ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shadow-2xs ${
                          fieldMeta.confidence === 'high'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : fieldMeta.confidence === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-orange-50 text-orange-700 border border-orange-200/80'
                        }`}
                      >
                        {fieldMeta.confidence === 'high' ? (
                          <CheckCircle2 size={11} strokeWidth={2.5} />
                        ) : fieldMeta.confidence === 'medium' ? (
                          <HelpCircle size={11} strokeWidth={2} />
                        ) : (
                          <AlertTriangle size={11} strokeWidth={2} />
                        )}
                        <span className="capitalize">{fieldMeta.confidence}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
                        <MinusCircle size={10} strokeWidth={2} />
                        <span>Not found</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Field Input Rendering */}
              <div>
                {field.type === 'text' && (
                  <input
                    id={`input-${field.id}`}
                    type="text"
                    value={value}
                    placeholder="Enter text..."
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input-premium w-full px-3 py-1.5 text-xs text-slate-900 bg-slate-50/60 border rounded-lg ${
                      flagged ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    id={`input-${field.id}`}
                    value={value}
                    rows={3}
                    placeholder="Enter multi-line text..."
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input-premium w-full px-3 py-1.5 text-xs text-slate-900 bg-slate-50/60 border rounded-lg ${
                      flagged ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                )}

                {field.type === 'number' && (
                  <input
                    id={`input-${field.id}`}
                    type="number"
                    value={value}
                    placeholder="0"
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input-premium w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-slate-50/60 border rounded-lg ${
                      flagged ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                )}

                {field.type === 'date' && (
                  <input
                    id={`input-${field.id}`}
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input-premium w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-slate-50/60 border rounded-lg ${
                      flagged ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                )}

                {field.type === 'dropdown' && (
                  <select
                    id={`input-${field.id}`}
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`input-premium w-full px-3 py-1.5 text-xs text-slate-900 bg-slate-50/60 border rounded-lg cursor-pointer ${
                      flagged ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <option value="">Select option...</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'checkbox' && (
                  <label className="btn-tactile inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/60 hover:bg-slate-100/60 border border-slate-200 rounded-lg cursor-pointer select-none">
                    <input
                      id={`input-${field.id}`}
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {value ? 'Confirmed / Yes' : 'Not marked / No'}
                    </span>
                  </label>
                )}
              </div>

              {/* Inline warning for missing required field */}
              {flagged && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-600 mt-2 bg-red-50/80 px-2.5 py-1.5 rounded-lg border border-red-200/60 shadow-2xs">
                  <AlertCircle size={13} strokeWidth={2} className="shrink-0" />
                  <span>Required field: no match found in document, please fill manually</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}