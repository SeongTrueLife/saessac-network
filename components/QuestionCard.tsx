import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  emoji: string;
}

interface QuestionCardProps {
  questionNumber: number;
  total: number;
  question: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export default function QuestionCard({
  questionNumber,
  total,
  question,
  options,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  const progress = (questionNumber / total) * 100;

  return (
    <div className="w-full max-w-md">
      {/* 진행률 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span className="font-medium text-gray-600">{questionNumber} / {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
        <p className="text-base font-medium text-gray-800 leading-relaxed">{question}</p>
      </div>

      {/* 선택지 */}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.98]',
              selectedValue === option.value
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'
            )}
          >
            <span className="text-xl mr-3">{option.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
