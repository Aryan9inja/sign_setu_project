interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onDismiss, className = '' }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className={`mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded ${className}`}>
      <div className="flex justify-between items-start">
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-red-400 hover:text-red-600 font-bold"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}