import { Sparkles, Zap } from 'lucide-react';

interface ExplanationResultProps {
  explanation: string;
  isFromCache: boolean;
}

export default function ExplanationResult({
  explanation,
  isFromCache,
}: ExplanationResultProps) {
  if (!explanation) return null;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-indigo-100 p-6'>
      <h3 className='text-lg font-semibold mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <Sparkles className='h-5 w-5 mr-2 text-indigo-600' />
          Explanation
        </div>
        {isFromCache && (
          <span className='flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full'>
            <Zap className='h-3 w-3 mr-1' />
            Instant (Cached)
          </span>
        )}
      </h3>
      <div
        className='prose prose-sm max-w-none text-gray-700'
        dangerouslySetInnerHTML={{
          __html: explanation
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        }}
      />
    </div>
  );
}
