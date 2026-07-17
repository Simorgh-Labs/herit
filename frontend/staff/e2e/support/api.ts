import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { API_HOST } from './config';

export interface ProposalDto {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  authorId: string;
  organisationId: string;
  rfpId: string | null;
  status: string;
  visibility: string;
}

export interface CfeoiDto {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  proposalId: string;
  status: string;
  tags: string | null;
}

export interface EoiDto {
  id: string;
  submittedById: string;
  submitterName: string;
  submitterEmail: string | null;
  message: string;
  cfeoiId: string;
  status: string;
  visibility: string;
}

export interface UserDto {
  id: string;
  externalId: string;
  email: string;
  fullName: string;
  role: string;
  organisationId: string | null;
}

export interface RfpDto {
  id: string;
  title: string;
  status: string;
}

/**
 * Thin typed wrapper over the Herit API for seeding and network-level
 * assertions. Every identity (anonymous, expat, staff, org admin, super admin)
 * gets its own instance so requests carry the right bearer token.
 */
export class Api {
  private constructor(private readonly ctx: APIRequestContext) {}

  static async forToken(token: string): Promise<Api> {
    return new Api(await request.newContext({
      baseURL: API_HOST,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    }));
  }

  static async anonymous(): Promise<Api> {
    return new Api(await request.newContext({ baseURL: API_HOST }));
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  private async send(method: string, url: string, data?: unknown): Promise<APIResponse> {
    // Content type is set explicitly so pre-serialized bodies (bare enum strings
    // like `"Resourcing"`, mirroring what the app's axios client sends) parse as JSON.
    const response = await this.ctx.fetch(`/api/v1${url}`, {
      method,
      data,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok()) {
      throw new Error(`${method} ${url} failed with ${response.status()}: ${await response.text()}`);
    }
    return response;
  }

  /** Raw fetch that does not throw — for asserting on status codes. */
  async raw(method: string, url: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.fetch(`/api/v1${url}`, {
      method,
      data,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Users ---

  /** JIT-registers the caller on first call, exactly like the portal does. */
  async getMe(): Promise<UserDto> {
    return (await this.send('GET', '/Users/me')).json();
  }

  async acceptTerms(profile: { email: string; nationality?: string; location?: string; expertiseTags?: string }): Promise<void> {
    await this.send('PATCH', '/Users/me/profile', { ...profile, termsAcceptedAt: new Date().toISOString() });
  }

  async listUsers(): Promise<UserDto[]> {
    return (await this.send('GET', '/Users')).json();
  }

  async createStaffUser(email: string, fullName: string, organisationId: string): Promise<string> {
    return (await this.send('POST', '/Users/staff', { email, fullName, organisationId })).json();
  }

  async updateStaffUser(id: string, payload: { email: string; fullName: string }): Promise<void> {
    await this.send('PUT', `/Users/staff/${id}`, payload);
  }

  async deleteStaffUser(id: string): Promise<void> {
    await this.send('DELETE', `/Users/staff/${id}`);
  }

  async createOrganisationAdmin(email: string, fullName: string, organisationId: string): Promise<string> {
    return (await this.send('POST', '/Users/organisation-admins', { email, fullName, organisationId })).json();
  }

  async deleteOrganisationAdmin(id: string): Promise<void> {
    await this.send('DELETE', `/Users/organisation-admins/${id}`);
  }

  // --- Organisations ---

  async createOrganisation(name: string, parentId?: string): Promise<string> {
    return (await this.send('POST', '/Organisations', { name, parentId })).json();
  }

  async updateOrganisation(id: string, name: string): Promise<void> {
    await this.send('PUT', `/Organisations/${id}`, { name });
  }

  async deleteOrganisation(id: string): Promise<void> {
    await this.send('DELETE', `/Organisations/${id}`);
  }

  // --- RFPs ---

  async createRfp(rfp: { title: string; shortDescription: string; organisationId: string; longDescription: string; tags?: string }): Promise<string> {
    return (await this.send('POST', '/Rfps', rfp)).json();
  }

  async updateRfpStatus(id: string, newStatus: string): Promise<void> {
    await this.send('PATCH', `/Rfps/${id}/status`, { newStatus });
  }

  async deleteRfp(id: string): Promise<void> {
    await this.send('DELETE', `/Rfps/${id}`);
  }

  async listRfps(): Promise<RfpDto[]> {
    return (await this.send('GET', '/Rfps')).json();
  }

  // --- Proposals ---

  async createProposal(proposal: { title: string; shortDescription: string; longDescription: string; organisationId: string; rfpId?: string }): Promise<string> {
    return (await this.send('POST', '/Proposals', proposal)).json();
  }

  async setProposalStatus(id: string, status: string): Promise<void> {
    await this.send('PATCH', `/Proposals/${id}/status`, JSON.stringify(status));
  }

  async setProposalVisibility(id: string, visibility: string): Promise<void> {
    await this.send('PATCH', `/Proposals/${id}/visibility`, JSON.stringify(visibility));
  }

  async deleteProposal(id: string): Promise<void> {
    await this.send('DELETE', `/Proposals/${id}`);
  }

  async listProposals(): Promise<ProposalDto[]> {
    return (await this.send('GET', '/Proposals')).json();
  }

  async getProposal(id: string): Promise<ProposalDto> {
    return (await this.send('GET', `/Proposals/${id}`)).json();
  }

  // --- CFEOIs ---

  async publishCfeoi(cfeoi: { title: string; description: string; resourceType: string; proposalId: string; tags?: string }): Promise<string> {
    return (await this.send('POST', '/Cfeoi', cfeoi)).json();
  }

  async setCfeoiStatus(id: string, newStatus: string): Promise<void> {
    await this.send('PATCH', `/Cfeoi/${id}/status`, { newStatus });
  }

  async listCfeois(params?: { status?: string; proposalId?: string }): Promise<CfeoiDto[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return (await this.send('GET', `/Cfeoi${query ? `?${query}` : ''}`)).json();
  }

  // --- EOIs ---

  async submitEoi(cfeoiId: string, message: string): Promise<string> {
    return (await this.send('POST', '/Eoi', { cfeoiId, message })).json();
  }

  async setEoiVisibility(id: string, visibility: string): Promise<void> {
    await this.send('PATCH', `/Eoi/${id}/visibility`, JSON.stringify(visibility));
  }

  async setEoiStatus(id: string, newStatus: string): Promise<void> {
    await this.send('PATCH', `/Eoi/${id}/status`, { newStatus });
  }

  async withdrawEoi(id: string): Promise<void> {
    await this.send('PATCH', `/Eoi/${id}/withdraw`);
  }

  async listMyEois(): Promise<EoiDto[]> {
    return (await this.send('GET', '/Eoi/my')).json();
  }

  async listEoisByCfeoi(cfeoiId: string): Promise<EoiDto[]> {
    return (await this.send('GET', `/Eoi?cfeoiId=${cfeoiId}`)).json();
  }
}
