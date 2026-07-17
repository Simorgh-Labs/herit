import { useSearchParams } from 'react-router-dom';

// Placeholder — the full RFP detail with lifecycle actions (flow 2a, screens 03–04) lands in a later issue.
// The in-app confirmation banner below is wired up for the editor's create/edit redirects.
export default function RfpDetailPage() {
  const [searchParams] = useSearchParams();
  const created = searchParams.get('created') === 'true';
  const updated = searchParams.get('updated') === 'true';

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      {created && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm font-medium">
          RFP created — it starts in Draft.
        </div>
      )}
      {updated && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-success-text/20 bg-status-success-bg text-status-success-text text-sm font-medium">
          RFP changes saved.
        </div>
      )}
      <p className="text-sm text-neutral-500">RFP detail is coming soon.</p>
    </div>
  );
}
