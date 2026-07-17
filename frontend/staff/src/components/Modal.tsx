import type { ReactNode } from 'react';

interface ModalProps {
  readonly tone: 'neutral' | 'danger';
  readonly icon: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly actions: ReactNode;
  readonly onClose: () => void;
}

/** Checkbox/summary-friendly confirm dialog shell — reused for the Approve, Publish and Delete RFP flows. */
export default function Modal({ tone, icon, title, description, children, actions, onClose }: ModalProps) {
  const iconBg = tone === 'danger' ? 'bg-status-danger-bg' : 'bg-brand-100';
  const iconColor = tone === 'danger' ? 'text-status-danger-text' : 'text-brand-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-0 rounded-xl shadow-floating max-w-[420px] w-full overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">{title}</h2>
          {description && <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>}
        </div>
        {children && <div className="px-6 pb-4">{children}</div>}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}
