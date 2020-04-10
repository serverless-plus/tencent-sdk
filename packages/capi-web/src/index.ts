interface CapiError {
  code?: string | number;
  Code?: string | number;
  cgwCode?: string | number;
  CgwCode?: string | number;
  Message?: string;
}

interface RequestData {
  Region?: string;
  Action?: string;
  Version?: string;
}
interface RequestParam {
  serviceType: string;
  action?: string;
  regionId?: number;
  data?: RequestData;
}

interface RequestOpts {
  isFormData?: string;
  clientTimeout?: number;
}

/**
 * whether is cam auth
 * @param {CapiError} e capi error
 */
export function isCamRefused(e: CapiError): boolean {
  e = e || {};
  const code = (e.code || e.Code) + '';
  return (
    code === '4102' ||
    code === '42' ||
    code.indexOf('UnauthorizedOperation') !== -1 ||
    code.indexOf('CamNoAuth') !== -1
  );
}

/**
 * whether need login
 * @param {CapiError} e capi error
 */
export function needLogin(e: CapiError): boolean {
  e = e || {};
  const code = (e.code || e.Code) + '';
  return code === 'VERIFY_LOGIN_FAILED';
}

/**
 * whther need auth
 * @param {CapiError} e capi error
 */
export function noAuth(e: CapiError): boolean {
  e = e || {};
  const code = (e.code || e.Code || e.cgwCode || e.CgwCode) + '';
  return code === '800200';
}

const API_DOMAIN = `iaas.${location.hostname.substring(
  location.hostname.indexOf('.') + 1,
)}`;
const API_VERSION = '2017-03-12';

const proxyReady = (id = 'qcbase-proxy'): Promise<any> => {
  let iframe: any;

  return new Promise((resolve, reject) => {
    iframe = document.getElementById(id);
    if (iframe) {
      // iframe 中的 domain 可能还没生效
      try {
        if (iframe.contentWindow.postSend) {
          return resolve(iframe.contentWindow.postSend);
        }
      } catch (e) {}
    } else {
      iframe = document.createElement('iframe');
      iframe.id = id;
      iframe.style.display = 'none';
      iframe.src = `//${API_DOMAIN}/proxy.html`;
      document.body.appendChild(iframe);
    }
    iframe.addEventListener('load', () => {
      try {
        resolve(iframe.contentWindow.postSend);
      } catch (e) {
        reject(e);
      }
    });
    iframe.addEventListener('error', reject);
  });
};

async function request(
  url: string,
  params: RequestParam,
  opts?: RequestOpts,
): Promise<any> {
  opts = opts || {};
  const postSend = await proxyReady();
  const data = await postSend(url, params, opts);
  return data;
}

/**
 * capi proxy request
 * @param {Object} data request data
 * @param {Object} opts request options
 * @return {Promise<Object>}
 */
export async function CapiRequest(
  params: RequestParam,
  opts?: RequestOpts,
): Promise<any> {
  opts = opts || {};

  const action = (params.data && params.data.Action) || params.action || '';

  params.data = params.data || {};
  if (!params.data.Version) {
    params.data.Version = API_VERSION;
  }

  const data = await request(
    `/cgi/capi?i=${params.serviceType}/${action}`,
    params,
    opts,
  );
  if (data.code === 'VERIFY_LOGIN_FAILED') {
    return data;
  }
  const Response = data && data.data && data.data.Response;
  if (Response && Response.Error) {
    throw Response.Error;
  }
  return Response;
}
