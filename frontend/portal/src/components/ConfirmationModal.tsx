interface ConfirmationModalProps {
  title: string;
  body: React.ReactNode;
  checkboxLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  confirmed: boolean;
  onConfirmedChange: (confirmed: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  isError?: boolean;
}

/** Checkbox-gated destructive confirmation modal — pattern from flow3b/07, reused across withdraw/delete/close actions. */
export default function ConfirmationModal({
  title,
  body,
  checkboxLabel,
  confirmLabel,
  pendingLabel,
  confirmed,
  onConfirmedChange,
  onConfirm,
  onCancel,
  isPending = false,
  isError = false,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => onConfirmedChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{checkboxLabel}</span>
          </label>
        </div>
        {isError && (
          <p className="text-sm text-red-600 px-6 pt-4">Something went wrong. Please try again.</p>
        )}
        <div className="px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
