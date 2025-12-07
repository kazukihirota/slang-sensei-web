import { Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { InputMode } from '../../type';

interface ExplanationResultProps {
  explanation: string;
  mode: InputMode;
}

export default function ExplanationResult({
  explanation,
  mode,
}: ExplanationResultProps) {
  if (!explanation) return null;

  const isGrammar = mode === 'grammar';
  const Icon = isGrammar ? FileText : Sparkles;
  const title = isGrammar ? 'Grammar Analysis' : 'Explanation';

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h3 className='text-lg font-semibold mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <Icon className='h-5 w-5 mr-2 text-indigo-600' />
          {title}
        </div>
      </h3>

      {isGrammar ? (
        <div className='prose prose-sm max-w-none'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom table styling
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="bg-indigo-50 font-semibold text-left px-4 py-2 border border-gray-200" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-2 border border-gray-200" {...props} />
              ),
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      ) : (
        <div
          className='prose prose-sm max-w-none text-gray-700'
          dangerouslySetInnerHTML={{
            __html: explanation
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      )}
    </div>
  );
}
