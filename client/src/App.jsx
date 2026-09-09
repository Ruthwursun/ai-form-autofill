import { useState } from 'react';
import {
  Sparkles,
  Download,
  RotateCcw,
  Save,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  FileCode2,
  Check,
} from 'lucide-react';
import FormBuilder from './FormBuilder';
import FormRenderer from './FormRenderer';
import DocumentUpload from './DocumentUpload';

export default function App() {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [meta, setMeta] = useState({});
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExtracted = (extracted) => {
    const newValues = {};
    const newMeta = {};
    Object.entries(extracted).forEach(([id, result]) => {
      newValues[id] = result.value ?? '';
      newMeta[id] = { found: result.found, confidence: result.confidence };
    });
    setValues(newValues);
    setMeta(newMeta);
    setSaved(false);
  };

  const missingRequired = fields.filter((f) => f.required && !values[f.id]);

  const handleSave = () => {
    if (missingRequired.length > 0) return;
    console.log('SAVED:', values);
    setSaved(true);
  };

  const handleDownload = () => {
    const exportData = {
      schema: fields,
      values: values,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const   link = document.createElement('a');
    link.href = url;
    link.download = 'form-data.json';
    link.click();
    URL.revokeObjectURL(url);

    // Instant tactile & visual feedback
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleReset = () => {
    setFields([]);
    setValues({});
    setMeta({});
    setSaved(false);
    setExported(false);
  };

  const hasExtracted = Object.keys(meta).length > 0;

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Top Studio Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Mark & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-studio-btn-primary border-t border-white/20 shrink-0">
              <FileCheck2 size={19} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                  Tecnots AI-POWERED FORM BUILDER & DOCUMENT AUTOFILL
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[10px] font-semibold text-blue-700 font-mono tracking-tight shadow-2xs">
                  <Sparkles size={10} strokeWidth={2} className="text-blue-600" />
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                Schema-driven document extraction and form auto-fill
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-lg shadow-studio-btn-neutral transition-colors"
              title="Clear all fields and values"
            >
              <RotateCcw size={13} strokeWidth={1.75} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={fields.length === 0}
              className={`btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-studio-btn-neutral border transition-all ${
                exported
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 disabled:opacity-40 disabled:pointer-events-none'
              }`}
              title="Download schema and values as JSON"
            >
              {exported ? (
                <>
                  <Check size={13} strokeWidth={2.5} className="text-emerald-600" />
                  <span className="hidden sm:inline">Exported!</span>
                </>
              ) : (
                <>
                  <Download size={13} strokeWidth={1.75} />
                  <span className="hidden sm:inline">Export JSON</span>
                </>
              )}
            </button>

            {hasExtracted && (
              <button
                type="button"
                onClick={handleSave}
                disabled={missingRequired.length > 0}
                className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-studio-btn-primary disabled:bg-slate-300 disabled:pointer-events-none disabled:shadow-none transition-all"
              >
                <Save size={13} strokeWidth={2} />
                <span>Save Form</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Saved Success Toast Banner */}
        {saved && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 text-xs font-medium shadow-studio-card transition-all">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-semibold text-emerald-950">Form saved successfully.</span>
                <span className="text-emerald-800 ml-1">Values are preserved in session state.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="px-2 py-1 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/60 text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Responsive Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Schema Builder & Document Ingestion */}
          <div className="lg:col-span-6 space-y-6">
            {/* Panel 1: Schema Definition */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-studio-card transition-shadow duration-200">
              <FormBuilder fields={fields} setFields={setFields} />
            </div>

            {/* Panel 2: Document Ingestion */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-studio-card transition-shadow duration-200">
              <DocumentUpload fields={fields} onExtracted={handleExtracted} />
            </div>
          </div>

          {/* Right Column: Live Form Review & Interaction */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-studio-card sticky top-20 transition-shadow duration-200">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80 shadow-2xs">
                    <FileCode2 size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                      {hasExtracted ? 'Review & Edit' : 'Live Form Preview'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {hasExtracted
                        ? 'Inspect AI-mapped values, edit fields, and verify data'
                        : 'Preview how your form looks in real time'}
                    </p>
                  </div>
                </div>

                {hasExtracted && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Extracted
                  </span>
                )}
              </div>

              {/* Missing required fields alert */}
              {hasExtracted && missingRequired.length > 0 && (
                <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs shadow-2xs">
                  <AlertCircle size={16} strokeWidth={2} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold">
                      {missingRequired.length} required {missingRequired.length === 1 ? 'field is' : 'fields are'} incomplete.
                    </span>{' '}
                    Please review highlighted inputs before saving.
                  </div>
                </div>
              )}

              {/* Form Renderer Component */}
              <FormRenderer
                fields={fields}
                values={values}
                setValues={setValues}
                meta={meta}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}