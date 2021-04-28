interface ApiErrorOptions {
  message: string;
  stack?: string;
  type: string;
  reqId?: string | number;
  code?: string;
  displayMsg?: string;
}

export class CommonError extends Error {
  type: string;
  reqId?: string | number;
  code?: string;
  displayMsg: string;

  constructor({
    type,
    message,
    stack,
    reqId,
    displayMsg,
    code,
  }: ApiErrorOptions) {
    super(message);
    this.type = type;
    if (stack) {
      this.stack = stack;
    }
    if (reqId) {
      this.reqId = reqId;
    }
    if (code) {
      this.code = code;
    }
    this.displayMsg = displayMsg ?? message;
    return this;
  }
}
