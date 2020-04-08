var domain =
  "iaas." + location.hostname.substring(location.hostname.indexOf(".") + 1);
var request = (exports.request = (function (root) {
  var proxyReady = function (id) {
    id = id || "qcbase-proxy";
    var iframe;

    return new Promise(function (resolve, reject) {
      iframe = document.getElementById(id);
      if (iframe) {
        // iframe 中的 domain 可能还没生效
        try {
          if (iframe.contentWindow.postSend) {
            return resolve(iframe.contentWindow.postSend);
          }
        } catch (e) { }
      } else {
        iframe = document.createElement("iframe");
        iframe.id = id;
        iframe.style.display = "none";
        iframe.src = "//" + domain + "/proxy.html";
        document.body.appendChild(iframe);
      }
      iframe.addEventListener("load", function () {
        try {
          resolve(iframe.contentWindow.postSend);
        } catch (e) {
          reject(e);
        }
      });
      iframe.addEventListener("error", reject);
    });
  };

  var request = function (url, params, opts) {
    opts = opts || {};
    return proxyReady()
      .then(function (postSend) {
        return postSend(url, params, opts);
      })
      .then(
        function (data) {
          data = data || {}
          return data.data;
        },
        function (e) {
          try {
            return JSON.parse(e.responseText);
          } catch (error) {
            return e.responseText;
          }
        }
      );
  };

  return request;
})(this));

/**
 * 云 api 代理
 * @param {Object} data { serviceType: "vpc", action: "DescribeVpc", regionId: 1, data: {offset:0, limit:10} }
 * @param {Object} [opts] 配置项
 * @return {Promise<Object>}
 */
exports.capiRequest = exports.apiRequest = function capiRequest (data, opts) {
  opts = opts || {};

  var action = (data.data && data.data.Action) || data.action || "";

  data.data = data.data || {};
  if (!data.data.Version) {
    data.data.Version = "2017-03-12";
  }

  return request(
    "/cgi/capi?i=" + data.serviceType + "/" + action,
    data,
    opts
  ).then(function (data) {
    var Response = data && data.Response;
    if (Response && Response.Error) {
      throw Response.Error;
    }
    return Response;
  });
};

/**
 * 是否未授权
 * @param {Object} e 云api请求抛出的异常
 */
export function isCamRefused (e) {
  e = e || {}
  const code = (e.code || e.Code) + ''
  return (
    code === '4102' ||
    code === '42' ||
    code.indexOf('UnauthorizedOperation') !== -1 ||
    code.indexOf('CamNoAuth') !== -1)
}

/**
 * 是否需要登录
 * @param {Object} e 云api请求抛出的异常
 */
export function needLogin (e) {
  e = e || {}
  const code = (e.code || e.Code) + ''
  return code === 'VERIFY_LOGIN_FAILED'

}

/**
 * 是否需要实名认证
 * @param {Object} e 云api请求抛出的异常
 */
export function noAuth (e) {
  e = e || {}
  const code = (e.code || e.Code || e.cgwCode || e.CgwCode) + ''
  return code === '800200'
}
