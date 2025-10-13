# Welcome to Cosmic Books

Cosmic books is your home for tech books!

## Technologies Used

1. Azure Cosmos DB
2. Azure Entra ID (Authentication & Authorization)
3. TypeScript
4. Node.js
5. Express
6. Passport.js

## Getting Started

📌 Ensure that you have the latest, actively supported version of [Node.js Latest Releases](https://nodejs.org/en/about/previous-releases#looking-for-the-latest-release-of-a-version-branch) <br/>
📌 Open VS Code, navigate to the Terminal, execute `npm install` <br/>
📌 Create a `.env` file in the project root directory (see Environment Setup below) <br/>
📌 Start the server with `npm run dev` and navigate to `http://localhost:3000/api-docs` for API documentation

## Using the API with Swagger

The Cosmic Books API is secured with Azure Entra ID Bearer token authentication. To test the API using the Swagger UI:

1. **Start the server**: Run `npm run dev`
2. **Navigate to Swagger UI**: Open `http://localhost:3000/api-docs` in your browser
3. **Obtain a Bearer token**: Get a valid JWT token from Azure Entra ID (see [Authentication](#authentication) section below)
4. **Authorize in Swagger**:
   - Click the **Authorize** button (lock icon) at the top right of the Swagger page
   - Enter your token in the format: `Bearer <your-jwt-token>` or just `<your-jwt-token>`
   - Click **Authorize** and then **Close**
5. **Test endpoints**: All API requests will now include your Bearer token in the Authorization header

<details>
<summary><strong>Environment Setup - Click to expand</strong></summary>

### Environment Variables Configuration

Create a `.env` file in the root of the project with the following variables:

#### Application Configuration

```bash
NODE_ENV=development
```

#### Azure Cosmos DB Configuration

```bash
CosmicReadsEndpoint=<your-cosmos-db-endpoint>
CosmicReadsDatabase=<your-database-name>
CosmicReadsBookContainer=<your-books-container-name>
CosmicReadsAuthorContainer=<your-authors-container-name>
```

#### Azure Monitoring & Tenant

```bash
ShawskyApplicationInsights='<your-app-insights-connection-string>'
ShawskyTenantId=<your-azure-tenant-id>
```

#### Azure Entra ID Authentication

```bash
CosmicBooksClientId=<your-entra-app-client-id>
CosmicBooksClientSecret=<your-entra-app-client-secret>
```

#### Azure Entra Configuration (Uses Variable Interpolation)

These variables automatically use `ShawskyTenantId` and `CosmicBooksClientId` from above:

```bash
AZURE_AUTHORITY=https://login.microsoftonline.com/${ShawskyTenantId}
AZURE_AUDIENCE=api://${CosmicBooksClientId}
AZURE_ISSUER=https://sts.windows.net/${ShawskyTenantId}/
AZURE_TOKEN_VERSION=v2
AZURE_VALIDATE_ISSUER=true
```

### Complete .env File Example

```bash
NODE_ENV=development
CosmicReadsEndpoint=https://your-cosmos.documents.azure.com:443/
CosmicReadsDatabase=PlatformDatabases
CosmicReadsBookContainer=CosmicReadsBooks
CosmicReadsAuthorContainer=CosmicReadsAuthors
ShawskyApplicationInsights='InstrumentationKey=xxx;IngestionEndpoint=https://xxx'
ShawskyTenantId=4addee7a-fa90-4d2e-9bdc-78d183eab7de
CosmicBooksClientId=3d45e1f5-8dec-4817-85d2-4d386f109642
CosmicBooksClientSecret=your-secret-here

AZURE_AUTHORITY=https://login.microsoftonline.com/${ShawskyTenantId}
AZURE_AUDIENCE=api://${CosmicBooksClientId}
AZURE_ISSUER=https://sts.windows.net/${ShawskyTenantId}/
AZURE_TOKEN_VERSION=v2
AZURE_VALIDATE_ISSUER=true
```

### Notes

- **Variable Interpolation**: The `.env` file uses `${VAR}` syntax for variable interpolation, powered by `dotenv-expand`
- **Never commit** your `.env` file to source control (it's in `.gitignore`)
- **Azure Entra Setup**: Ensure your Entra ID application is configured with:
  - Exposed API scopes: `Books.Read`, `Books.Write`, `Delete.Books`
  - App roles: `Books.Admin`, `Books.Writer`, `Books.Reader`
  - Redirect URI: `https://oauth.pstmn.io/v1/callback` (for Postman testing)

</details>
