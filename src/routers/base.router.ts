import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
// eslint-disable-next-line import/no-unresolved
import { PathParams, RequestHandlerParams } from 'express-serve-static-core';
import * as httpStatus from 'http-status-codes';

import { debug } from '../debug';

export interface IServerResponse<T> {
    state: string;
    message: string;
    data?: T;
}

export interface IResponse extends Response {
    route?: string[];
    data?: IServerResponse<any>;
}

type Method = 'post' | 'put' | 'get' | 'delete' | 'all';

export abstract class BaseRouter {

    protected static debug = debug.extend('router');

    public router = Router();

    protected constructor() {
        BaseRouter.debug(`New express router: ${this.constructor.name}`);
    }

    public static sendResponse<T>(response: Response, statusCode: number, message: string, data?: T): Response {
        const state = statusCode < 400 ? 'success' : 'error';

        const responseData: IServerResponse<T> = {
            data,
            message,
            state,
        };

        if (!data) {
            delete responseData.data;
        }
        response.status(statusCode);
        (response as IResponse).data = responseData;
        return response.json(responseData);
    }

    public static sendSuccessResponse<T>(response: Response, data?: T): Response {
        return BaseRouter.sendResponse(response, httpStatus.OK, 'OK', data);
    }

    public static send404(response: Response, message = 'Not Found'): Response {
        return BaseRouter.sendResponse(response, httpStatus.NOT_FOUND, message);
    }

    public static checkBodyParameters(
        request: Request, response: Response, nextFunction: NextFunction, params: string[]
    ): NextFunction | undefined {
        const missingParameters = params.filter((param) => !Object.keys(request.body).includes(param));
        if (missingParameters.length) {
            BaseRouter.sendResponse(response, httpStatus.BAD_REQUEST, 'MissingParameters', missingParameters);
            return;
        }
        return nextFunction;
    }

    public static checkQueryParameters(
        request: Request, response: Response, nextFunction: NextFunction, params: string[]
    ): NextFunction | undefined {
        const missingParameters = params.filter((param) => !Object.keys(request.query).includes(param));
        if (missingParameters.length) {
            BaseRouter.sendResponse(response, httpStatus.BAD_REQUEST, 'MissingParameters', missingParameters);
            return;
        }
        return nextFunction;
    }

    public static requestDecorator(func: (x: Request, y: Response, z: any, a?: any) => any, ...extraArgs: any[]) {
        return (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
            const originalFunction = descriptor.value;

            descriptor.value = async function descriptorValue(...args: any[]) {
                const nextFunction = await func(args[0], args[1], originalFunction, extraArgs);
                if (nextFunction) {
                    return nextFunction.apply(this, args);
                }
            };

            return descriptor;
        };
    }

    public createRoute(method: Method, url: PathParams, ...handlers: Array<RequestHandler | RequestHandlerParams>): void {
        BaseRouter.debug(`New route: ${method.toUpperCase()} ${url}`);
        this.router[method](url, ...handlers.map((handler) => this.asyncHandler(handler)));
    }

    private asyncHandler(routeFunction: any): any {
        return (request: Request, response: IResponse, next: NextFunction) => {
            if (!response.route) {
                response.route = [];
            }
            response.route.push(`${this.constructor.name}`);
            Promise.resolve(routeFunction(request, response, next)).catch(next);
        };
    }
}
