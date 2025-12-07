import { Sparkles, FileText } from 'lucide-react';
import type { InputMode } from '../type';

interface ModeToggleProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const baseClasses = "flex-1 flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all";
  const activeClasses = "bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-md";
  const inactiveClasses = "bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-2 mb-6">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('slang')}
          className={`${baseClasses} ${mode === 'slang' ? activeClasses : inactiveClasses}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Slang Lookup</span>
        </button>
        <button
          onClick={() => onModeChange('grammar')}
          className={`${baseClasses} ${mode === 'grammar' ? activeClasses : inactiveClasses}`}
        >
          <FileText className="h-4 w-4" />
          <span>Grammar Analysis</span>
        </button>
      </div>
    </div>
  );
}
