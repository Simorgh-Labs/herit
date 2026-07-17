import { SignJWT } from 'jose';
import { SIGNING_KEY, TOKEN_AUDIENCE, TOKEN_ISSUER } from './config';

/**
 * External IDs are derived from the email exactly like the API's
 * LocalTestIdentityProviderService does, so tokens minted here resolve to the
 * users the seeder/staff endpoints create.
 */
export const externalIdFor = (email: string): string => `e2e-${email}`;

/** Mint an HS256 bearer token the API's TestAuth scheme accepts. */
export async function mintToken(email: string, name: string): Promise<string> {
  const key = new TextEncoder().encode(SIGNING_KEY);
  return new SignJWT({ oid: externalIdFor(email), email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setSubject(externalIdFor(email))
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}
