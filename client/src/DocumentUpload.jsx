import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  ImageIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export default function DocumentUpload({ fields, onExtracted }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | extracting | done | error
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  // Automatically clear "build form first" warning as soon as user adds fields
  const activeError = (fields.length > 0 && errorMsg.includes('build the form first')) ? '' : errorMsg;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDropzoneClick = () => {
    if (status === 'uploading' || status === 'extracting') return;

    if (fields.length === 0) {
      setErrorMsg('Please build the form first before uploading a document. Add at least one field to your form schema.');
      return;
    }

    inputRef.current?.click();
  };

  const handleFile = async (file) => {
    setErrorMsg('');

    if (!file) return;

    if (fields.length === 0) {
      setErrorMsg('Please build the form first before uploading a document. Add at least one field to your form schema.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported file type "${file.type || 'unknown'}". Please upload a PDF, PNG, or JPG.`);
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setFileType(file.type.includes('pdf') ? 'pdf' : 'image');
    setStatus('uploading');

    const formData = new FormData();
    formData.append('document', file);
    formData.append(
      'schema',
      JSON.stringify(
        fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
        }))
      )
    );

    try {
      setStatus('extracting');
      const res = await fetch('https://ai-form-autofill.onrender.com/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Extraction failed. Please check the document and try again.');
        setStatus('error');
        return;
      }

      setStatus('done');
      onExtracted(data.extracted);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to extraction server. Ensure the backend server is running on port 5000.');
      setStatus('error');
    }
  };

  const resetUpload = (e) => {
    e?.stopPropagation();
    setStatus('idle');
    setFileName('');
    setFileSize(null);
    setFileType('');
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <UploadCloud size={15} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Source Document</h3>
            <p className="text-[11px] text-slate-500">Upload document for AI autofill extraction</p>
          </div>
        </div>

        {status === 'done' && (
          <button
            type="button"
            onClick={resetUpload}
            className="btn-tactile inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={12} strokeWidth={1.75} />
            <span>Replace file</span>
          </button>
        )}
      </div>

      {/* Prominent Alert Instructing User to Build Form First */}
      {activeError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs shadow-2xs animate-in fade-in duration-150"
        >
          <div className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
            <AlertCircle size={14} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <span className="font-semibold block text-amber-950">Build the form first</span>
            <span className="text-amber-800 text-[11px] leading-relaxed block mt-0.5">
              {activeError}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-amber-500 hover:text-amber-800 text-xs p-1 rounded transition-colors"
            title="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div
        onClick={handleDropzoneClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (fields.length === 0) {
            setErrorMsg('Please build the form first before uploading a document. Add at least one field to your form schema.');
            return;
          }
          if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        className={`group relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 shadow-sm scale-[0.99]'
            : status === 'done'
            ? 'border-emerald-300/80 bg-emerald-50/20 shadow-2xs'
            : status === 'error'
            ? 'border-red-300 bg-red-50/30'
            : fields.length === 0
            ? 'border-amber-200/90 hover:border-amber-300 bg-amber-50/20 hover:bg-amber-50/40'
            : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50/70 hover:shadow-2xs'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFile(file);
            }
            e.target.value = '';
          }}
        />

        {/* Idle State: When no fields configured yet */}
        {status === 'idle' && fields.length === 0 && (
          <div className="py-2">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform duration-150">
              <UploadCloud size={20} strokeWidth={1.75} />
            </div>
            <p className="text-xs font-semibold text-slate-800 mb-1">
              Upload Document
            </p>
            <p className="text-[11px] text-amber-700 font-medium mb-2.5">
              Please build the form first before uploading a document
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50/80 border border-amber-200/80 text-[10px] font-medium text-amber-800 shadow-2xs">
              <AlertCircle size={11} strokeWidth={2} className="text-amber-600" />
              <span>Requires at least 1 schema field</span>
            </div>
          </div>
        )}

        {/* Idle State: When fields exist */}
        {status === 'idle' && fields.length > 0 && (
          <div className="py-2">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-blue-600 mx-auto flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-transform duration-150">
              <UploadCloud size={20} strokeWidth={1.75} />
            </div>
            <p className="text-xs font-semibold text-slate-800 mb-1">
              Click to browse or drop your document here
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Supports PDF invoices, forms, resumes, or PNG/JPG scans
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200/80 text-[10px] font-mono text-slate-600 shadow-2xs">
              <span>PDF</span>
              <span className="text-slate-300">•</span>
              <span>PNG</span>
              <span className="text-slate-300">•</span>
              <span>JPG</span>
            </div>
          </div>
        )}

        {/* Uploading or Extracting State */}
        {(status === 'uploading' || status === 'extracting') && (
          <div className="py-4 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
              <Loader2 size={20} strokeWidth={2} className="animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 mb-0.5">
                {status === 'extracting'
                  ? 'Analyzing document and matching schema fields...'
                  : 'Ingesting document...'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {fileName} {fileSize ? `(${fileSize})` : ''}
              </p>
            </div>
            {/* Stage indicator pill */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-md border border-blue-100 shadow-2xs">
                <Sparkles size={10} strokeWidth={2} />
                Gemini Vision Extraction
              </span>
            </div>
          </div>
        )}

        {/* Done State */}
        {status === 'done' && (
          <div className="py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2 shadow-2xs">
              <FileCheck2 size={16} strokeWidth={2} className="text-emerald-600" />
              <span className="text-xs font-semibold">Extraction Complete</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-700 font-medium">
              {fileType === 'pdf' ? (
                <FileText size={15} className="text-slate-400" />
              ) : (
                <ImageIcon size={15} className="text-slate-400" />
              )}
              <span className="truncate max-w-[220px]">{fileName}</span>
              {fileSize && <span className="text-slate-400 font-mono text-[10px]">({fileSize})</span>}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Values extracted and mapped to preview. Review results on the right.
            </p>
          </div>
        )}

        {/* Error inside dropzone */}
        {status === 'error' && (
          <div className="py-2">
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-2 border border-red-100 shadow-2xs">
              <AlertCircle size={18} strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-red-700 mb-1">Upload was not completed</p>
            <p className="text-[11px] text-red-600 max-w-xs mx-auto mb-2">{errorMsg}</p>
            <button
              type="button"
              onClick={resetUpload}
              className="btn-tactile inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-100/60 hover:bg-red-100 rounded-md transition-colors"
            >
              <RefreshCw size={11} strokeWidth={1.75} />
              <span>Try again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
