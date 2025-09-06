import './env';

/**
 * Configuration for Azure Entra ID (formerly Azure AD) authentication
 * Uses passport-azure-ad BearerStrategy for JWT token validation
 */
export interface AzureAuthConfig {
  credentials: {
    tenantID: string;
    clientID: string;
    audience: string;
    issuer: string;
  };
  metadata: {
    authority: string;
    discovery: string;
    version: string;
  };
  settings: {
    validateIssuer: boolean;
    passReqToCallback: boolean;
    loggingLevel: 'info' | 'warn' | 'error' | null;
    loggingNoPII: boolean;
  };
  roles: {
    admin: string;
    writer: string;
    reader: string;
  };
}

const tenantId = process.env.ShawskyTenantId;
const clientId = process.env.CosmicBooksClientId;
const audience = process.env.AZURE_AUDIENCE;
const issuer = process.env.AZURE_ISSUER;

if (!tenantId) {
  throw new Error('ShawskyTenantId is not configured. Please set it in your .env file.');
}

if (!clientId) {
  throw new Error('CosmicBooksClientId is not configured. Please set it in your .env file.');
}

if (!audience) {
  throw new Error('AZURE_AUDIENCE is not configured. Please set it in your .env file.');
}

const authConfig: AzureAuthConfig = {
  credentials: {
    tenantID: tenantId,
    clientID: clientId,
    audience: audience,
    issuer: issuer || `https://sts.windows.net/${tenantId}/`,
  },
  metadata: {
    authority: `https://login.microsoftonline.com/${tenantId}`,
    discovery: '.well-known/openid-configuration',
    version: process.env.AZURE_TOKEN_VERSION || 'v2.0',
  },
  settings: {
    validateIssuer: process.env.AZURE_VALIDATE_ISSUER === 'true',
    passReqToCallback: false,
    loggingLevel: process.env.NODE_ENV === 'development' ? 'info' : null,
    loggingNoPII: process.env.NODE_ENV !== 'development',
  },
  roles: {
    admin: 'Books.Admin',
    writer: 'Books.Writer',
    reader: 'Books.Reader',
  },
};

export default authConfig;
