targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Optional parameters to override the default azd resource naming conventions. Update the main.parameters.json file to provide values. e.g.,:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param apiServiceName string = ''
param applicationInsightsDashboardName string = ''
param applicationInsightsName string = ''
param appServicePlanName string = ''
param keyVaultName string = ''
param logAnalyticsName string = ''
param resourceGroupName string = ''
param sqlServerName string = ''
param webServiceName string = ''
param apimServiceName string = ''
param connectionStringKey string = 'AZURE-SQL-CONNECTION-STRING'

@description('Flag to use Azure API Management to mediate the calls between the Web frontend and the backend API')
param useAPIM bool = false

@description('API Management SKU to use if APIM is enabled')
param apimSku string = 'Consumption'

@description('Id of the user or app to assign application roles')
param principalId string = ''

@secure()
@description('SQL Server administrator password')
param sqlAdminPassword string

@secure()
@description('Application user password')
param appUserPassword string
param appUser string = 'appUser'

@description('Microsoft Entra External ID client ID for the API app registration')
param entraClientId string

@secure()
@description('Microsoft Entra External ID client secret for Graph API access')
param entraClientSecret string

@secure()
@description('Microsoft Entra External ID tenant ID')
param entraTenantId string

@description('Microsoft Entra External ID authority base URL, e.g. https://<tenant>.ciamlogin.com')
param entraAuthority string

@description('Microsoft Entra External ID tenant domain, e.g. <tenant>.onmicrosoft.com')
param entraTenant string
var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }
// Derive the CIAM subdomain from entraAuthority (e.g. "heritdomain" from
// "https://heritdomain.ciamlogin.com"). This is the ground truth for the
// CIAM tenant name. entraTenant may use a GUID-based onmicrosoft.com domain
// (e.g. "72b4b7c4-…onmicrosoft.com") rather than the friendly subdomain,
// so we must NOT use entraTenant to derive the CIAM subdomain.
var ciamSubdomain = split(split(entraAuthority, '//')[1], '.')[0]

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// The application frontend
module web './app/web-appservice-avm.bicep' = {
  name: 'web'
  scope: rg
  params: {
    name: !empty(webServiceName) ? webServiceName : '${abbrs.webSitesAppService}web-${resourceToken}'
    location: location
    tags: tags
    appServicePlanId: appServicePlan.outputs.resourceId
    appInsightResourceId: monitoring.outputs.applicationInsightsResourceId
    linuxFxVersion: 'node|20-lts'
  }
}

// The application backend
module api './app/api-appservice-avm.bicep' = {
  name: 'api'
  scope: rg
  params: {
    name: !empty(apiServiceName) ? apiServiceName : '${abbrs.webSitesAppService}api-${resourceToken}'
    location: location
    tags: tags
    kind: 'app'
    appServicePlanId: appServicePlan.outputs.resourceId
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'dotnetcore|10.0'
    }
    appSettings: {
      AZURE_KEY_VAULT_ENDPOINT: keyVault.outputs.uri
      AZURE_SQL_CONNECTION_STRING_KEY: connectionStringKey
      SCM_DO_BUILD_DURING_DEPLOYMENT: false
      AzureAd__Instance: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=entra-authority)'
      AzureAd__Domain: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=entra-tenant)'
      AzureAd__TenantId: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=entra-tenant-id)'
      AzureAd__ClientId: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=entra-client-id)'
      AllowedOrigins__0: web.outputs.SERVICE_WEB_URI
    }
    appInsightResourceId: monitoring.outputs.applicationInsightsResourceId
    allowedOrigins: [web.outputs.SERVICE_WEB_URI]
  }
}

// Give the API access to KeyVault
module accessKeyVault 'br/public:avm/res/key-vault/vault:0.3.5' = {
  name: 'accesskeyvault'
  scope: rg
  params: {
    name: keyVault.outputs.name
    enableRbacAuthorization: false
    enableVaultForDeployment: false
    enableVaultForTemplateDeployment: false
    enablePurgeProtection: false
    sku: 'standard'
    accessPolicies: [
      {
        objectId: principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
      {
        objectId: api.outputs.SERVICE_API_IDENTITY_PRINCIPAL_ID
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
    secrets: {
      secureList: [
        {
          name: 'sqlAdmin'
          value: sqlAdminPassword
        }
        {
          name: 'appUser'
          value: appUserPassword
        }
        {
          name: connectionStringKey
          value: 'Server=${sqlService.outputs.sqlServerName}${environment().suffixes.sqlServerHostname}; Database=${sqlService.outputs.databaseName}; User=${appUser}; Password=${appUserPassword}'
        }
        {
          name: 'entra-client-id'
          value: entraClientId
        }
        {
          name: 'entra-client-secret'
          value: entraClientSecret
        }
        {
          name: 'entra-tenant-id'
          value: entraTenantId
        }
        {
          name: 'entra-authority'
          value: entraAuthority
        }
        {
          name: 'entra-tenant'
          value: entraTenant
        }
      ]
    }
  }
}

// The application database
module sqlService './app/db-avm.bicep' = {
  name: 'sqldeploymentscript'
  scope: rg
  params: {
    location: location
    appUserPassword: appUserPassword
    sqlAdminPassword: sqlAdminPassword
    sqlServiceName: !empty(sqlServerName) ? sqlServerName : '${abbrs.sqlServers}${resourceToken}'
    appUser: appUser
  }
}

// Create an App Service Plan to group applications under the same payment plan and SKU
module appServicePlan 'br/public:avm/res/web/serverfarm:0.1.0' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    sku: {
      name: 'B1'
      tier: 'Basic'
    }
    location: location
    tags: tags
    reserved: true
    kind: 'Linux'
  }
}

// Create a keyvault to store secrets
module keyVault 'br/public:avm/res/key-vault/vault:0.3.5' = {
  name: 'keyvault'
  scope: rg
  params: {
    name: !empty(keyVaultName) ? keyVaultName : '${abbrs.keyVaultVaults}${resourceToken}'
    location: location
    tags: tags
    enableRbacAuthorization: false
    enableVaultForDeployment: false
    enableVaultForTemplateDeployment: false
    enablePurgeProtection: false
    sku: 'standard'
  }
}

// Monitor application with Azure Monitor
module monitoring 'br/public:avm/ptn/azd/monitoring:0.1.0' = {
  name: 'monitoring'
  scope: rg
  params: {
    applicationInsightsName: !empty(applicationInsightsName) ? applicationInsightsName : '${abbrs.insightsComponents}${resourceToken}'
    logAnalyticsName: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsDashboardName: !empty(applicationInsightsDashboardName) ? applicationInsightsDashboardName : '${abbrs.portalDashboards}${resourceToken}'
    location: location
    tags: tags
  }
}

// Creates Azure API Management (APIM) service to mediate the requests between the frontend and the backend API
module apim 'br/public:avm/res/api-management/service:0.2.0' = if (useAPIM) {
  name: 'apim-deployment'
  scope: rg
  params: {
    name: !empty(apimServiceName) ? apimServiceName : '${abbrs.apiManagementService}${resourceToken}'
    publisherEmail: 'noreply@microsoft.com'
    publisherName: 'n/a'
    location: location
    tags: tags
    sku: apimSku
    skuCount: 0
    zones: []
    customProperties: {}
    loggers: [
      {
        name: 'app-insights-logger'
        credentials: {
          instrumentationKey: monitoring.outputs.applicationInsightsInstrumentationKey
        }
        loggerDescription: 'Logger to Azure Application Insights'
        isBuffered: false
        loggerType: 'applicationInsights'
        targetResourceId: monitoring.outputs.applicationInsightsResourceId
      }
    ]
  }
}

//Configures the API settings for an api app within the Azure API Management (APIM) service.
module apimApi 'br/public:avm/ptn/azd/apim-api:0.1.0' = if (useAPIM) {
  name: 'apim-api-deployment'
  scope: rg
  params: {
    apiBackendUrl: api.outputs.SERVICE_API_URI
    apiDescription: 'This is a simple Todo API'
    apiDisplayName: 'Simple Todo API'
    apiName: 'todo-api'
    apiPath: 'todo'
    name: useAPIM ? apim.outputs.name : ''
    webFrontendUrl: web.outputs.SERVICE_WEB_URI
    location: location
    apiAppName: api.outputs.SERVICE_API_NAME
  }
}

// Data outputs
output AZURE_SQL_CONNECTION_STRING_KEY string = connectionStringKey

// App outputs
output APPLICATIONINSIGHTS_CONNECTION_STRING string = monitoring.outputs.applicationInsightsConnectionString
output AZURE_KEY_VAULT_ENDPOINT string = keyVault.outputs.uri
output AZURE_KEY_VAULT_NAME string = keyVault.outputs.name
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output API_BASE_URL string = useAPIM ? apimApi.outputs.serviceApiUri : api.outputs.SERVICE_API_URI
output REACT_APP_WEB_BASE_URL string = web.outputs.SERVICE_WEB_URI
output USE_APIM bool = useAPIM
output SERVICE_API_ENDPOINTS array = useAPIM ? [apimApi.outputs.serviceApiUri, api.outputs.SERVICE_API_URI] : []

// Frontend build-time env vars
output VITE_API_BASE_URL string = '${api.outputs.SERVICE_API_URI}/api/v1'
output VITE_REDIRECT_URI string = web.outputs.SERVICE_WEB_URI
output VITE_AZURE_CLIENT_ID string = entraClientId
output VITE_AZURE_TENANT_NAME string = ciamSubdomain
output VITE_AZURE_AUTHORITY string = '${entraAuthority}/${ciamSubdomain}.onmicrosoft.com/'
output VITE_API_SCOPE string = 'api://${entraClientId}/access_as_user'
