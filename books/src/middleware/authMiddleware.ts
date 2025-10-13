import passport from 'passport';
import { BearerStrategy, IBearerStrategyOptionWithRequest, ITokenPayload } from 'passport-azure-ad';
import authConfig from '../config/authConfig';

/**
 * Azure Entra ID Bearer Strategy Configuration
 *
 * This middleware validates JWT Bearer tokens from Azure Entra ID.
 * It extracts user information and claims from the token and attaches them to req.user and req.authInfo.
 *
 * Token Structure:
 * - req.user: Contains user profile information (oid, preferred_username, name, etc.)
 * - req.authInfo: Contains token claims including:
 *   - scp: Scopes (space-delimited string, e.g., "Books.Read Books.Write")
 *   - roles: App roles (array, e.g., ["Books.Admin", "Books.Writer"])
 *   - aud: Audience (should match your API's Application ID URI)
 *   - iss: Issuer (Azure AD)
 *   - tid: Tenant ID
 */

const bearerStrategyOptions: IBearerStrategyOptionWithRequest = {
  identityMetadata: `${authConfig.metadata.authority}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
  clientID: authConfig.credentials.clientID,
  audience: authConfig.credentials.audience,
  issuer: authConfig.credentials.issuer,
  validateIssuer: authConfig.settings.validateIssuer,
  passReqToCallback: authConfig.settings.passReqToCallback,
  loggingLevel: authConfig.settings.loggingLevel || undefined,
  loggingNoPII: authConfig.settings.loggingNoPII,
};

/**
 * Bearer Strategy Verification Callback
 *
 * This function is called after the token is validated.
 * The token payload contains all claims from the JWT.
 */
const bearerStrategy = new BearerStrategy(
  bearerStrategyOptions,
  (token: ITokenPayload, done: (error: Error | null, user?: ITokenPayload | false, info?: unknown) => void) => {
    // Token has been validated by passport-azure-ad... Log token info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Token validated for user:', token.preferred_username || token.upn || token.name);
      console.log('📋 Scopes:', token.scp);
      console.log('👤 Roles:', token.roles);
    }

    // Return the token payload as the user object. This will be available in req.authInfo
    return done(null, token, token);
  },
);

// Initialize Passport with Bearer Strategy
passport.use(bearerStrategy);

/**
 * Middleware to authenticate requests using Azure Entra ID JWT tokens
 *
 * Usage:
 * ```typescript
 * router.get('/protected', authenticateToken, (req, res) => {
 *   // req.authInfo contains token claims
 *   res.json({ user: req.authInfo });
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const authenticateToken = passport.authenticate('oauth-bearer', { session: false });

/**
 * Type definitions for Express Request with authentication
 * Add this to your express types or use declaration merging
 */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace Express {
    interface User extends ITokenPayload {}
    interface AuthInfo extends ITokenPayload {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
/* eslint-enable @typescript-eslint/no-namespace */

export default passport;
