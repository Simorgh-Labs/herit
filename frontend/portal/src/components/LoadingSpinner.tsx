interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-8 h-8 border-4 border-gray-200 border-t-brand rounded-full animate-spin" />
    </div>
  );
}
