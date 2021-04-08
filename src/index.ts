import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';

export { ServiceController, IOption, IRoute } from './controllers/service.controller';
export { BaseRouter, IServerResponse } from './routers/base.router';
export { NotFoundRoute } from './routes/not-found.route';
export { AjvValidationRoute } from './routes/ajv-validation.route';
export { RequestLogger } from './loggers/request.logger';
export { handleExceptions, handleSignals } from './utils/graceful-shutdown.util';
export { Request, Params, Unsure } from './utils/types.util';
export { NextFunction, RequestHandler, Response, Router } from 'express';
// eslint-disable-next-line import/no-unresolved
export { PathParams, RequestHandlerParams } from 'express-serve-static-core';
export { bodyParser, compression, express };
