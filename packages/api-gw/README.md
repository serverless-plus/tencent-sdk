# Tencent Api Gateway

Tencent Api Gateway api tools.


## ApiGwRequest Instance Options

| Name | Description | Type | Required | Default |
| ------ | ------- | ------- | --------- | ------- |
| `Region`      | request region | string | true | ap-guangzhou | 
| `SecretId` | tencent account secret id | string | true | '' |
| `SecretKey` | tencenttencent account secret key | string | true | '' |
| `debug` |  whether enable log debug info | boolean | false | false |
| `host` |  request host | string | false | false |
| `baseHost`  | request domain | string | false | 'api.qcloud.com' |
| `path`  | request path | string | false | '/' |
| `method`  | request method | string | false | 'POST' |
| `protocol`  | request protocol | string | false | 'https' |
| `SignatureMethod`  | request signature | string | false | 'sha1' |

## Suppper Apis

### CreateService

Delete api gateway service

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceName` | false  | String | User customize service name, if not set, system will auto generate an unique name |
| `serviceDesc` | false  | String | User customize service description|
| `protocol`    | true   |     String  | Service protocal for frontend request using |

### DeleteService

Delete api gateway service

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |

### DescribeService

Gdt api gateway service detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |

### ReleaseService

Release api gateway service

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `environmentName`  | true | Boolean  | Releasing evironment name, support values: test,prepub,release |
| `unReleaseDesc` | true | String | unrelease description |

### UnReleaseService

Unrelease api gateway service

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `environmentName`  | true | Boolean  | Releasing evironment name, support values: test,prepub,release |
| `releaseDesc` | true | String | release description |

### DescribeService

Gdt api gateway service detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |

### CreateApi

Create api interface

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `serviceType`  | true |  Boolean |  Backend api service type, support values：HTTP、MOCK、SCF. |
| `serviceTimeout`  | true |  Int |  Service timeout value, unit: second |
| `apiName`  | false |   String |  User customize api name, if not set, it will be created automatically |
| `apiDesc`  | false |   String |  User customize api description |
| `apiType`  | false |   String |  Api type |
| `authRequired`  | false |   String |  | whether need authentication or not. Default is true. If want to open to cloud market, must be true |
| `enableCORS`  | false |   String |  Whether enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), default is false |
| `requestConfig.path`  | true |  String | Request path |
| `requestConfig.method`  | true |  String |  Request method |
| _**requestParameters**_  | false |   `requestParameter[]` |  Frontend api request parameters |
| `serviceConfig.url`  | false |   String |  Request url. When `serviceType` is `HTTP`, this parameter is required |
| `serviceConfig.path`  | false |   String |  Request path, like `/path`. When `serviceType` is `HTTP`, this parameter is required |
| `serviceConfig.method`  | false | String |  Request method. When `serviceType` is `HTTP`, this parameter is required |
| _**serviceParameters**_  | false | `serviceParameter[]` |  Api service parameter name. When `serviceType` is `HTTP`, this parameter is required.|
| _**constantParameters**_ | false | `constantParameter[]` |  Constant parameter name. When `serviceType` is `HTTP`, this parameter is required. |
| `serviceMockReturnMessage`  | false |   String |  Backend api service mock return. When `serviceType` is `MOCK`, this parameter is required. |
| `serviceScfFunctionName`  | false |   String |  SCF function name for backend api service. When `serviceType` is `SCF`, this parameter is required. |
| `serviceScfIsIntegratedResponse`  | false |   String | Whether enable SCF integrated response. When `serviceType` is `SCF`, this parameter is required. Default is `false` |
| `serviceScfFunctionQualifier`  | false |   String |  SCF function version, default is `$LATEST`. |
| `responseType`  | false |   String |  Customize response return type. Support values: HTML、JSON、TEST、BINARY、XML.（This option is only for generate API document.） |
| `responseSuccessExample`  | false |   String |  Customize success response example. (This option is only for generate API document.) |
| `responseFailExample`  | false |   String |  Customize fail response example. (This option is only for generate API document.) |
| _**responseErrorCodes**_  | false |  `responseErrorCode[]` |  Customize error response code. (This option is only for generate API document.) |

#### requestParameter

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `name`  | false |   String |  Frontend api request `name` |
| `position`  | false |   String |  Frontend api request position, support values: PATH,QUERY,HEADER. |
| `type`  | false |   String |  Frontend api parameter type，eg: String,Int. |
| `defaultValue`  | false | String |  Frontend api parameter default value |
| `required`  | false |   Boolean |  Whether this frontend api parameter is requested |
| `desc`  | false |   String |  Frontend api request paremter remarks |

#### serviceParameter

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `name`  | false | String |  Api service parameter name. When `serviceType` is `HTTP`, this parameter is required.|
| `position`  | false |   String |  Api service parameter position, like `head`. When `serviceType` is `HTTP`, this parameter is required. |
| `relevantRequestParameterName`  | false |   String |  Backend service parameter maps to frontend parameter name. When `serviceType` is `HTTP`, this parameter is required. |
| `relevantRequestParameterPosition`  | false |   String |  Backend service parameter maps to frontend parameter position. When `serviceType` is `HTTP`, this parameter is required. |
| `desc`  | false |   String |  Backend api service description. When `serviceType` is `HTTP`, this parameter is required. |

#### constantParameter

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `name`  | false |   String |  Constant parameter name. When `serviceType` is `HTTP`, this parameter is required. |
| `desc`  | false |   String |  Constant parameter description. When `serviceType` is `HTTP`, this parameter is required. |
| `position`  | false |   String |  Constant parameter position. Support values: header,query. When `serviceType` is `HTTP`, this parameter is required. |
| `defaultValue`  | false |   String |  Constant parameter default value. When `serviceType` is `HTTP`, this parameter is required. |

#### responseErrorCode

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `code`  | false |   Int |  Customize error response code. (This option is only for generate API document.) |
| `msg`  | false |   String |  Customize error response message. (This option is only for generate API document.) |
| `desc`  | false |   String |  Customize error response description. (This option is only for generate API document.) |


### ModifyApi

Modify api interface

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `serviceType`  | true |  Boolean |  Backend api service type, support values：HTTP、MOCK、SCF. |
| `serviceTimeout`  | true |  Int |  Service timeout value, unit: second |
| `apiId` | true  | String | Api ID |
| `apiName`  | false |   String |  User customize api name, if not set, it will be created automatically |
| `apiDesc`  | false |   String |  User customize api description |
| `apiType`  | false |   String |  Api type |
| `authRequired`  | false |   String |  | whether need authentication or not. Default is true. If want to open to cloud market, must be true |
| `enableCORS`  | false |   String |  Whether enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), default is false |
| `requestConfig.path`  | true |  String | Request path |
| `requestConfig.method`  | true |  String |  Request method |
| _**requestParameters**_  | false |   `requestParameter[]` |  Frontend api request parameters |
| `serviceConfig.url`  | false |   String |  Request url. When `serviceType` is `HTTP`, this parameter is required |
| `serviceConfig.path`  | false |   String |  Request path, like `/path`. When `serviceType` is `HTTP`, this parameter is required |
| `serviceConfig.method`  | false | String |  Request method. When `serviceType` is `HTTP`, this parameter is required |
| _**serviceParameters**_  | false | `serviceParameter[]` |  Api service parameter name. When `serviceType` is `HTTP`, this parameter is required.|
| _**constantParameters**_ | false | `constantParameter[]` |  Constant parameter name. When `serviceType` is `HTTP`, this parameter is required. |
| `serviceMockReturnMessage`  | false |   String |  Backend api service mock return. When `serviceType` is `MOCK`, this parameter is required. |
| `serviceScfFunctionName`  | false |   String |  SCF function name for backend api service. When `serviceType` is `SCF`, this parameter is required. |
| `serviceScfIsIntegratedResponse`  | false |   String | Whether enable SCF integrated response. When `serviceType` is `SCF`, this parameter is required. Default is `false` |
| `serviceScfFunctionQualifier`  | false |   String |  SCF function version, default is `$LATEST`. |
| `responseType`  | false |   String |  Customize response return type. Support values: HTML、JSON、TEST、BINARY、XML.（This option is only for generate API document.） |
| `responseSuccessExample`  | false |   String |  Customize success response example. (This option is only for generate API document.) |
| `responseFailExample`  | false |   String |  Customize fail response example. (This option is only for generate API document.) |
| _**responseErrorCodes**_  | false |  `responseErrorCode[]` |  Customize error response code. (This option is only for generate API document.) |

### DescribeApi

Get api interface detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `apiId` | true  | String | Api ID |

### DeleteApi

Delete api interface detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `apiId` | true  | String | Api ID |

### DescribeApisStatus

Delete api interface detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `apiIds` | false  | `String[]` | Array of Api ID |
| `offset` |   false |   Int |   Query offset, default is `0`. |
| `limit` |   false |   Int |   Query length, default is `20`, max is `100`. |
| `orderby` |   false |   String |   Order by field. |
| `order` |   false |   String |   Order method, support values: asc,desc. |
| `searchName` |   false |   String |   Fuzzy search by api path name |
| `searchId` |   false |   String |   Accurate search by api id |



### CreateUsagePlan

Create usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanName` |   false | String | 	usage plan name  |
| `usagePlanDesc` |   false | String | 	usage plan description |
| `maxRequestNumPreSec` |   false | Int | 	max request number per second, default is `1000`|
| `maxRequestNum` |   false | Int | Max request number, `-1` represent no limit for request number. |


### ModifyUsagePlan

Modify usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |
| `usagePlanName` |   false | String | 	usage plan name  |
| `usagePlanDesc` |   false | String | 	usage plan description |
| `maxRequestNumPreSec` |   false | Int | 	max request number per second, default is `1000`|
| `maxRequestNum` |   false | Int | Max request number, `-1` represent no limit for request number. |


### DescribeUsagePlan

Get usage plan detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |

### DeleteUsagePlan

Delete usage plan detail

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |

### DescribeUsagePlanSecretIds

Get Secrete Ids of usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |
| `limit` |	false | 	Int	| Query length |
| `offset` |	false | 	Int	| Query offset |


### DescribeApiUsagePlan

Get usage plan detail of api service

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `serviceId` | true  | String | Service ID |
| `apiIds` | false  | `String[]` | Array of Api ID |
| `offset` |   false |   Int |   Query offset, default is `0`. |
| `limit` |   false |   Int |   Query length, default is `20`, max is `100`. |
| `searchEnvironment` |	false | 	String |	Accurate search by environment name of usage plan. |


### BindSecretIds

Bind secret key for usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |
| `secretIds` | 	true | 	String[] |	Array of secret id |

### UnBindSecretIds

Unbind secret key for usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanId` |  true | String | 	usage plan id  |
| `secretIds` | 	true | 	String[] |	Array of secret id |


### BindEnvironment

Bind service environment for usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanIds` |  true | String[] | Array of usage plan id  |
| `secretIds` | 	true | 	String[] |	Array of secret id |
| `environment`	| true| 	String |	Service enviroment(service id / api id) |
| `bindType` | 	false | 	String | 	Bind type, support values: API, SERVICE. Default is `SERVICE。` |
| `apiIds` |  false | 	String[] |  Array of app id, when bindType is 'API', it's required |

### UnBindEnvironment

UnBind service environment for usage plan

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `usagePlanIds` |  true | String[] | Array of usage plan id  |
| `secretIds` | 	true | 	String[] |	Array of secret id |
| `environment`	| true| 	String |	Service enviroment(service id / api id) |
| `bindType` | 	false | 	String | 	Bind type, support values: API, SERVICE. Default is `SERVICE。` |
| `apiIds` |  false | 	String[] |  Array of app id, when bindType is 'API', it's required |


### CreateApiKey

Create api secret key

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| secretName | 	false | 	String |	Customize secret name用户自定义密钥名称。 |
| secretId | 	false | 	String |	Customize secret id. When type is `manual`, it's required. Regular: `[0-9a-zA-Z_]{5, 50}` |
| secretKey | 	false | 	String | Customize secret key. When type is `manual`, it's required. Regular: `[0-9a-zA-Z_]{10, 50}`  |
| type | 	false | 	String |	Secret type. Support value: `auto`, `manual`, default is `auto` |

### DeleteApiKey

Delete api secret key

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| secretId | 	false | 	String |	secret id |

### DisableApiKey

Disable api secret key

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| secretId | 	false | 	String |	secret id |

### EnableApiKey

Enable api secret key

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| secretId | 	false | 	String |	secret id |

### DescribeApiKeysStatus

Get api secret key list

**Request Parameters**

| Name        | Required   | Type     | Description                               |
| ----------- | ------ | ------ | -------------------------------- |
| `secretIds` | 	false | 	String[] |	secret id |
| `offset` |   false |   Int |   Query offset, default is `0`. |
| `limit` |   false |   Int |   Query length, default is `20`, max is `100`. |
| `orderby` |   false |   String |   Order by field. |
| `order` |   false |   String |   Order method, support values: asc,desc. |
| `searchName` |   false |   String |   Fuzzy search by secret name |
| `searchId` |   false |   String |   Accurate search by secret id |
