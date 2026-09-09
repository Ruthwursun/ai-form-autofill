import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  ListFilter,
  CheckSquare,
  Sparkles,
  Layers,
  X,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { FIELD_TYPES, createField, SCHEMA_PRESETS } from './types';

const TYPE_ICONS = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  date: Calendar,
  dropdown: ListFilter,
  checkbox: CheckSquare,
};

function DropdownOptionsManager({ field, updateField }) {
  const [inputValue, setInputValue] = useState('');

  const addOptions = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    const current = field.options || [];
    // Support single item or comma-separated items
    const newItems = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !current.includes(s));

    if (newItems.length > 0) {
      updateField(field.id, { options: [...current, ...newItems] });
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOptions(inputValue);
    } else if (e.key === ',') {
      e.preventDefault();
      addOptions(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && field.options?.length > 0) {
      const current = field.options || [];
      updateField(field.id, { options: current.slice(0, -1) });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      addOptions(val);
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addOptions(inputValue);
    }
  };

  const removeOption = (optToRemove) => {
    const current = field.options || [];
    updateField(field.id, {
      options: current.filter((o) => o !== optToRemove),
    });
  };

  const options = field.options || [];

  return (
    <div className="pt-2 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-700">
          Dropdown Options {options.length > 0 ? `(${options.length})` : ''}:
        </span>
        <span className="text-[10px] text-slate-400">
          Type and press Enter or click Add
        </span>
      </div>

      {options.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto pr-1">
          {options.map((opt) => (
            <span
              key={opt}
              className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 bg-blue-50/90 border border-blue-200/80 text-blue-800 text-[11px] font-medium rounded-md shadow-2xs group"
            >
              <span>{opt}</span>
              <button
                type="button"
                onClick={() => removeOption(opt)}
                className="text-blue-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition-colors"
                title={`Remove "${opt}"`}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic">
          No options configured yet. Add options for users to select from.
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          placeholder={
            options.length > 0
              ? 'Add another option...'
              : 'Add option (e.g. Sales, Engineering, HR)...'
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="input-premium flex-1 px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-md"
        />
        <button
          type="button"
          onClick={() => addOptions(inputValue)}
          disabled={!inputValue.trim()}
          className="btn-tactile px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 disabled:opacity-40 disabled:pointer-events-none rounded-md transition-all shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function FormBuilder({ fields, setFields }) {
  const [activePresetOpen, setActivePresetOpen] = useState(false);

  const addField = () => {
    setFields([...fields, createField()]);
  };

  const updateField = (id, updates) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const moveField = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    setFields(newFields);
  };

  const loadPreset = (preset) => {
    const loadedFields = preset.fields.map((f) => createField(f));
    setFields(loadedFields);
    setActivePresetOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Builder Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <Layers size={17} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Form Schema</h2>
            <p className="text-xs text-slate-500">
              {fields.length === 0
                ? 'Define extraction target fields'
                : `${fields.length} ${fields.length === 1 ? 'field' : 'fields'} configured`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset templates popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePresetOpen(!activePresetOpen)}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-studio-btn-neutral"
              title="Load sample schema preset"
            >
              <Sparkles size={13} strokeWidth={1.75} className="text-blue-600" />
              <span>Templates</span>
            </button>

            {activePresetOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setActivePresetOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200/90 shadow-studio-popover p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Start Presets
                  </div>
                  {SCHEMA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadPreset(preset)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50/50 hover:text-blue-900 transition-colors group flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {preset.description}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400 font-mono">
                          {preset.fields.length} fields
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={addField}
            className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-studio-btn-neutral transition-all"
          >
            <Plus size={14} strokeWidth={2} />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {fields.length === 0 && (
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-2xl p-8 text-center shadow-studio-card">
          <div className="h-12 w-12 rounded-xl bg-white text-blue-600 mx-auto flex items-center justify-center mb-3.5 border border-slate-200/80 shadow-2xs">
            <SlidersHorizontal size={22} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">No fields in your schema</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Add individual fields for the data points you need to capture, or load a sample preset to test autofill immediately.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {SCHEMA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                <Sparkles size={12} strokeWidth={1.75} className="text-blue-600" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Field Cards List */}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const IconComp = TYPE_ICONS[field.type] || Type;

          return (
            <div
              key={field.id}
              className="group border border-slate-200/90 rounded-xl p-3.5 bg-white shadow-studio-card hover:border-slate-300 hover:shadow-studio-elevated transition-all duration-200"
            >
              <div className="flex items-start gap-2.5">
                {/* Reorder and Index Controls */}
                <div className="flex flex-col items-center justify-center pt-0.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold mb-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                      aria-label="Move field up"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronUp size={13} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, 1)}
                      disabled={index === fields.length - 1}
                      aria-label="Move field down"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronDown size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Field Details */}
                <div className="flex-1 space-y-2.5">
                  {/* Label Row */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <IconComp size={14} strokeWidth={1.75} />
                      </div>
                      <input
                        type="text"
                        placeholder="Field label (e.g. Candidate Name, Total Due)"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="input-premium w-full pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/60 border border-slate-200 rounded-lg"
                      />
                    </div>

                    {/* Type Selector */}
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                      className="input-premium px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50/60 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    {/* Interactive Required Micro-Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.required}
                      onClick={() => updateField(field.id, { required: !field.required })}
                      className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all select-none ${
                        field.required
                          ? 'bg-blue-50/90 border-blue-200 text-blue-700 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Toggle required status"
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                          field.required ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      />
                      <span>Req</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      title="Remove field"
                      className="btn-tactile p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* Dropdown Options Manager */}
                  {field.type === 'dropdown' && (
                    <DropdownOptionsManager
                      field={field}
                      updateField={updateField}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}