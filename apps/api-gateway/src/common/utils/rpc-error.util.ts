import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Errors coming back from `ClientProxy.send()` are plain objects (not HttpException
 * instances) shaped like `{ statusCode, message }` when the microservice threw an
 * RpcException, or `{ status: 'error', message: 'Internal server error' }` for anything
 * else. Nest's default HTTP exception handling doesn't know how to read either shape, so
 * without this conversion every microservice error surfaces to the client as an opaque 500.
 */
export function toHttpException(err: unknown): HttpException {
  if (err instanceof HttpException) return err;

  const rpcError = err as any;
  
  // If the microservice threw an object like { statusCode: 400, message: '...' }
  // NestJS sometimes wraps it in `err.error` or `err.response`.
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  if (rpcError?.statusCode) {
    statusCode = rpcError.statusCode;
    message = rpcError.message || message;
  } else if (rpcError?.error?.statusCode) {
    statusCode = rpcError.error.statusCode;
    message = rpcError.error.message || message;
  } else if (rpcError?.response?.statusCode) {
    statusCode = rpcError.response.statusCode;
    message = rpcError.response.message || message;
  } else if (typeof rpcError?.message === 'string') {
    message = rpcError.message;
    // Default to 400 if it's a known auth error string just in case
    if (message.includes('wrong_email') || message.includes('user_already')) {
      statusCode = 400;
    }
  } else if (rpcError?.message && rpcError.message.statusCode) {
    statusCode = rpcError.message.statusCode;
    message = rpcError.message.message || message;
  }

  return new HttpException(message, statusCode);
}
