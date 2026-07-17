import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRfp, getRfpById, updateRfp } from '../../api/rfps';
import { listOrganisations } from '../../api/organisations';
import LoadingSpinner from '../../components/LoadingSpinner';

const TITLE_MAX_LENGTH = 256;
const SHORT_DESCRIPTION_MAX_LENGTH = 512;

interface FormErrors {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  organisationId?: string;
}

export default function RfpEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const {
    data: rfp,
    isLoading: isRfpLoading,
    isError: isRfpError,
  } = useQuery({
    queryKey: ['rfps', id],
    queryFn: () => getRfpById(id!),
    enabled: isEdit,
  });

  const { data: organisations, isLoading: isOrgsLoading } = useQuery({
    queryKey: ['organisations'],
    queryFn: listOrganisations,
  });

  useEffect(() => {
    if (rfp) {
      setTitle(rfp.title);
      setShortDescription(rfp.shortDescription);
      setLongDescription(rfp.longDescription);
      setOrganisationId(rfp.organisationId);
      setTags(rfp.tags ?? '');
    }
  }, [rfp]);

  const mutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        tags: tags.trim() || undefined,
      };
      if (isEdit) {
        await updateRfp(id!, payload);
        return id!;
      }
      return createRfp({ ...payload, organisationId });
    },
    onSuccess: (rfpId) => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      navigate(`/rfps/${rfpId}?${isEdit ? 'updated' : 'created'}=true`);
    },
  });

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    else if (title.length > TITLE_MAX_LENGTH) nextErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;

    if (!shortDescription.trim()) nextErrors.shortDescription = 'Short description is required.';
    else if (shortDescription.length > SHORT_DESCRIPTION_MAX_LENGTH)
      nextErrors.shortDescription = `Short description must be ${SHORT_DESCRIPTION_MAX_LENGTH} characters or fewer.`;

    if (!longDescription.trim()) nextErrors.longDescription = 'Long description is required.';

    if (!isEdit && !organisationId) nextErrors.organisationId = 'Organisation is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  if (isEdit && isRfpLoading) return <LoadingSpinner className="py-32" />;

  if (isEdit && (isRfpError || !rfp)) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">RFP not found</h2>
        <p className="text-sm text-neutral-500 mb-6">This RFP may have been removed.</p>
        <Link to="/rfps" className="text-brand hover:underline font-medium text-sm">
          ← Back to RFPs
        </Link>
      </div>
    );
  }

  const isPublished = isEdit && rfp?.status === 'Published';
  const cancelTo = isEdit ? `/rfps/${id}` : '/rfps';
  const saveLabel = isEdit ? 'Save changes' : 'Create RFP';
  const submitLabel = mutation.isPending ? 'Saving...' : saveLabel;

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8 pb-16">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1.5">{isEdit ? 'Edit RFP' : 'Create new RFP'}</h1>
      <p className="text-sm text-neutral-500 mb-5">
        {isEdit
          ? 'Update the details for this RFP.'
          : 'New RFPs start in Draft. You can approve and publish it once it is ready.'}
      </p>

      {isPublished && (
        <div className="mb-5 px-4 py-3 rounded-lg border border-status-info-text/20 bg-status-info-bg text-status-info-text text-sm">
          <p className="font-semibold mb-0.5">This RFP is live on the portal</p>
          <p>
            Saving here updates the published RFP immediately — there is no re-approval step. Expats browsing the
            portal see your changes as soon as you save.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-neutral-0 border border-neutral-200 rounded-lg shadow-soft p-6">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-900 mb-1.5">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Digital ID Verification for Remote Diaspora Voting"
              className="w-full px-3.5 h-[42px] bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
            />
            {errors.title && <p className="mt-1 text-xs text-status-danger-text">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-neutral-900 mb-1.5">
              Short description
            </label>
            <textarea
              id="shortDescription"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One or two sentences shown in list and card views."
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow resize-y"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.shortDescription}</p>
            )}
          </div>

          <div>
            <label htmlFor="longDescription" className="block text-sm font-medium text-neutral-900 mb-1.5">
              Long description
            </label>
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="flex gap-1 px-2.5 py-2 bg-neutral-50 border-b border-neutral-200">
                {['bold', 'italic', 'list-ul', 'list-ol', 'link'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    disabled
                    aria-hidden="true"
                    tabIndex={-1}
                    className="w-7 h-7 rounded flex items-center justify-center text-neutral-400 cursor-default"
                  >
                    <i className={`fa-solid fa-${icon} text-xs`} />
                  </button>
                ))}
              </div>
              <textarea
                id="longDescription"
                rows={7}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Full RFP scope, deliverables, timeline and eligibility."
                className="w-full px-3.5 py-2.5 bg-white text-sm focus:outline-none resize-y border-0"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              Toolbar matches the portal's rich-text editor convention; formatting controls are illustrative here.
            </p>
            {errors.longDescription && (
              <p className="mt-1 text-xs text-status-danger-text">{errors.longDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organisationId" className="block text-sm font-medium text-neutral-900 mb-1.5">
                Organisation
              </label>
              <select
                id="organisationId"
                value={organisationId}
                onChange={(e) => setOrganisationId(e.target.value)}
                disabled={isEdit || isOrgsLoading}
                className="w-full px-3.5 h-[42px] bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="" disabled>
                  Select an organisation
                </option>
                {(organisations ?? []).map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {isEdit ? (
                <p className="mt-1.5 text-xs text-neutral-400">Organisation cannot be changed after creation.</p>
              ) : (
                errors.organisationId && <p className="mt-1 text-xs text-status-danger-text">{errors.organisationId}</p>
              )}
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-neutral-900 mb-1.5">
                Tags <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. identity, voting, remote"
                className="w-full px-3.5 h-[42px] bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
              />
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-status-danger-text">
              {isEdit ? 'Failed to save changes.' : 'Failed to create RFP.'} Please check the form and try again.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-neutral-200">
          <Link
            to={cancelTo}
            className="inline-flex items-center px-4 h-10 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-4 h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
