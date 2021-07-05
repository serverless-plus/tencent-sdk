const ERRORS = {
  OTHER_GET_FAAS_ERROR: {
    type: 'API_FAAS_get',
    code: `1000`,
  },
  GET_FAAS_ERROR: {
    type: 'API_FAAS_get',
    code: `1001`,
    message: `[FAAS] 无法找到指定函数，请部署后调用或检查函数名称`,
  },
  GET_CLS_CONFIG_ERROR: {
    type: 'API_FAAS_getClsConfig',
    code: `1002`,
    message: `[FAAS] 无法获取函数 CLS 配置，请检查函数是否配置 CLS 功能`,
  },
  REQUEST_ID_INVALID: {
    type: 'API_FAAS_getLogByReqId',
    code: `1003`,
    message: `[FAAS] 参数 reqId(请求 ID) 无效`,
  },
  WEB_FAAS_NO_TRIGGERS: {
    type: 'API_FAAS_getTriggers',
    code: `1004`,
    message: `[FAAS] WEB 类型函数必须配置 API 网关触发器才能执行`,
  },
  NAMESPACE_NOT_EXIST_ERROR: {
    type: 'API_FAAS_namespace',
    code: `1005`,
    message: '[FAAS] 未找到指定的 namespace，请创建后再试',
  },

  QUALIFIER_NOT_EXIST_ERROR: {
    type: 'API_FAAS_qualifier',
    code: `1006`,
    message: '[FAAS] 未找到指定的 qualifier',
  },
};

export { ERRORS };
