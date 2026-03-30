## Overview
- This plan creates a set of high-level flowchart diagrams that fully describe the Expat (Herit Portal) user journeys for browsing, authentication, proposal creation & lifecycle, CFEOI publishing, and EOI management. 
- The diagrams are organized to be easy to expand later into detailed flows and wireframes; each diagram names the screens/steps, decision points, and notification messages so designers and stakeholders can follow the complete experience.

## Plan Details
- **Diagram type:** Flowchart (one diagram per major flow). Each diagram uses clear start/end nodes, numbered steps, decision diamonds, and notification/confirmation nodes.

### Diagram set (overview)
1. **Unauthenticated Browsing** — public access to RFPs, public proposals and CFEOIs
2. **Authentication (Sign in with Google + JIT Registration)** — sign-in, first-time profile creation, landing into authenticated experience
3. **Authenticated Expat Flows** — split into five focused flowcharts:
   a. Create a Proposal (standalone or in response to an RFP)
   b. Manage Proposal Lifecycle (edit, save draft, submit, withdraw, delete, visibility)
   c. Publish a CFEOI under a Proposal
   d. Manage Incoming EOIs (review, approve, reject, message)
   e. Browse CFEOIs & Submit/Withdraw EOI (including contributor EOI visibility management)

### 1) Unauthenticated Browsing (flow nodes & branches)
- Start: Public Landing / Home
- Node 1: RFP List (published) — filters & search
- Node 2: RFP Detail page (read-only) — attachments, publish date, department contacts
  - Action: Download / Bookmark (prompts sign-in for bookmark persistence)
- Branch: From landing or RFP list → Public Proposals List
- Node 3: Proposal Detail (public) — summary, attachments, status, CFEOIs list
- Node 4: CFEOI Detail (public) — roles requested, slots, deadline, contact info
- Decision: Attempt to interact (Express Interest / Apply / Comment / Bookmark)?
  - If Yes → Prompt: Sign in with Google (link to Authentication flow)
  - If No → End (continue browsing)
- Include: Email subscription CTA (subscribe to RFP or proposal updates) → Confirmation message + subscription confirmation email node

### 2) Authentication (Sign in with Google → JIT registration)
- Start: Sign in with Google
- Node 1: Google OAuth flow (success/failure)
  - Failure → Error / retry or Contact Support (end)
- Decision: Is this first-time sign-in (JIT registration)?
  - If Yes → Node 2: JIT Registration form (minimal profile: name, nationality, location, expertise tags, accept terms)
    - Action: Submit → Confirmation message + Welcome email
  - If No → Continue
- Node 3: Post-login Landing (authenticated dashboard or the page the user was attempting) — show contextual CTA if they were mid-action (e.g., submitting an EOI)
- End: Authenticated session established

### 3a) Create a Proposal (standalone or in response to an RFP)
- Start: Click "Create Proposal" or "Respond to RFP" from RFP Detail
- Decision: Create type? (Standalone / Respond to RFP)
  - If Respond to RFP → Pre-fill RFP reference and required fields
- Node: Proposal Editor (fields: title, summary, objectives, budget, timeline, attachments, visibility settings: Draft / Public / Private / Submit to RFP)
- Actions:
  - Save Draft → Confirmation message + Draft-saved email (optional)
  - Preview → Open read-only preview
  - Publish (if public) or Submit to RFP (if responding) → Confirmation modal
- Outcome:
  - On Submit to RFP: send confirmation message to user + notification email to the target government department (include proposal metadata)
  - On Publish Publicly: public proposal appears in public list and CFEOI publishing option becomes available
- End: Proposal created in chosen state

### 3b) Manage Proposal Lifecycle (update, submit, withdraw, delete, visibility)
- Start: User opens My Proposals list
- Node: Proposal Card → Actions menu (Edit, Submit, Withdraw, Delete, Publish/Unpublish, Publish CFEOI)
- Edit flow:
  - Edit → Save Draft or Update Published version → Confirmation message + update email to subscribers
- Submit flow:
  - Submit → Confirmation modal → After submission: status = Submitted; notify department; confirmation email to user
- Withdraw flow:
  - Withdraw → Confirmation modal (reason optional) → status = Withdrawn; notify department; confirmation email
- Delete flow:
  - Delete → Confirmation modal (permanent) → remove from user’s list; send deletion confirmation
- Visibility control:
  - Toggle visibility (Public / Private / Team-only) → immediate change + confirmation message
- End: Proposal updated or state changed

### 3c) Publish a CFEOI under a Proposal
- Start: From Proposal Detail (owner) click "Publish CFEOI"
- Node: CFEOI Form (role title, skills, number of slots, duration, location, compensation, visibility, deadline, external links)
- Actions:
  - Save Draft CFEOI → Confirmation
  - Publish CFEOI → Confirmation modal
- Outcome:
  - CFEOI appears on proposal page and public CFEOI list
  - Notifications: email to subscribers and optionally to specific candidate lists; confirmation email to owner
- End: CFEOI published

### 3d) Manage Incoming EOIs on a Proposal
- Start: Owner opens Proposal → EOIs tab/Inbox
- Node: EOI List (filters: new, reviewed, approved, rejected, withdrawn)
- For each EOI:
  - View profile & message, download CV
  - Actions: Approve → status Approved → send approval email to contributor; Reject → status Rejected → send rejection email; Message → send internal message and email notification
  - Mark as Read / Add notes / Assign to slot
- Special cases:
  - Contributor withdraws EOI → notify owner → mark withdrawn
- End: EOIs processed and statuses updated; all actions trigger confirmation messages and emails to relevant parties

### 3e) Browse CFEOIs & Submit/Withdraw EOI (contributor perspective)
- Start: Browse CFEOI list or CFEOI detail page
- Node: CFEOI Detail → "Express Interest" button
- Decision: Authenticated?
  - If No → redirect to Authentication flow (Sign in with Google)
  - If Yes → Node: EOI form (cover message, availability, CV link, optional fields)
- Actions:
  - Submit EOI → show confirmation message + email to contributor + notification email to proposal owner
  - Withdraw EOI → confirmation modal → mark withdrawn + notify owner + send confirmation email to contributor
  - Manage EOI visibility (on contributor’s My EOIs page): toggle visibility (Public / Hidden) → confirmation message
- End: EOI status updated and notifications dispatched

### Cross-cutting notification & confirmation rules (for all diagrams)
- Every successful create/submit/publish/approve/reject/withdraw/delete action must include:
  - Immediate in-app confirmation message (toast or modal)
  - Follow-up email with summary and relevant metadata
- Error states: failed save/failed submit/OAuth failure should show inline error and an email or in-app notification when action eventually succeeds (where applicable)

### Diagram organization & recommended next steps
- Produce the initial set as **separate flowcharts**: Unauthenticated Browsing, Authentication, Proposal Creation, Proposal Lifecycle, CFEOI Publishing, EOI Management, and CFEOI Browser/EOI Submission. Group them visually in a single folder and include a small master index diagram that links to each flowchart.
- Start with these high-level flowcharts. After review, expand any selected flow into a detailed, screen-by-screen flow that includes field-level validation, modal text, and edge cases.

### What the diagrams will explicitly include
- Clear start/end nodes, numbered steps, decision diamonds, and notification nodes
- Screen/step labels that match the future wireframe names (e.g., "Proposal Editor", "CFEOI Detail", "My EOIs")
- All email notification triggers and confirmation messages called out as nodes
- Visibility and permission decision points (public vs authenticated vs owner-only actions)

### What will be left for the detailed phase
- Exact field lists and validation rules
- Precise modal copy, success/failure microcopy, and error messages
- Accessibility annotations and micro-interaction specs

## Acceptance criteria
- Each flowchart shows an explicit start and end, all decision points, and all actions listed above.
- Notification nodes are present for the five most important events (proposal submit, CFEOI publish, EOI submit, EOI approval/rejection, proposal withdraw/delete).
- Diagrams are structured so each can be expanded into screen-level flows for wireframing.

