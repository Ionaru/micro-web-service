import { Debugger } from 'debug';
import { NextFunction, Request, Response, Router } from 'express';
// eslint-disable-next-line import/no-unresolved
import { PathParams, RequestHandlerParams, RequestHandler } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';

export interface IServerResponse<T = undefined> {
    state: string;
    message: string;
    data?: T;
}

export interface IResponse extends Response {
    route?: string[];
    data?: IServerResponse<any>;
}

type Method = 'post' | 'put' | 'patch' | 'get' | 'delete' | 'all';

export abstract class BaseRouter {

    public router = Router();

    private readonly debug?: Debugger;

    protected constructor(debug?: Debugger) {
        this.debug = debug ? debug.extend('BaseRouter') : debug;
        this.log(`New express router: ${this.constructor.name}`);
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

    public static sendSuccess<T>(response: Response, data?: T): Response {
        return BaseRouter.sendResponse(response, StatusCodes.OK, 'OK', data);
    }

    public static sendBadRequest(response: Response, property: unknown, reason: string): Response {
        return BaseRouter.sendResponse(response, StatusCodes.BAD_REQUEST, 'Bad Request', {property, reason});
    }

    public static sendNotFound(response: Response, url: string): Response {
        return BaseRouter.sendResponse(response, StatusCodes.NOT_FOUND, 'Not Found', {url});
    }

    public static sendMethodNotAllowed(response: Response, method: string, url: string): Response {
        return BaseRouter.sendResponse(response, StatusCodes.METHOD_NOT_ALLOWED, 'Method not allowed', {method, url});
    }

    public static notFound(request: Request, response: Response): Response {
        return BaseRouter.sendNotFound(response, request.originalUrl);
    }

    public static methodNotAllowed(request: Request, response: Response): Response {
        return BaseRouter.sendMethodNotAllowed(response, request.method, request.originalUrl);
    }

    public static checkBodyParameters(
        request: Request, response: Response, nextFunction: NextFunction, params: string[]
    ): NextFunction | undefined {
        const missingParameters = params.filter((param) => !Object.keys(request.body).includes(param));
        if (missingParameters.length) {
            BaseRouter.sendResponse(response, StatusCodes.BAD_REQUEST, 'MissingParameters', missingParameters);
            return;
        }
        return nextFunction;
    }

    public static checkQueryParameters(
        request: Request, response: Response, nextFunction: NextFunction, params: string[]
    ): NextFunction | undefined {
        const missingParameters = params.filter((param) => !Object.keys(request.query).includes(param));
        if (missingParameters.length) {
            BaseRouter.sendResponse(response, StatusCodes.BAD_REQUEST, 'MissingParameters', missingParameters);
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
        const handlerMapper = (handler: RequestHandler | RequestHandlerParams) => 'name' in handler ? handler.name : 'handler';
        this.log(`New route: ${method.toUpperCase().padEnd(6)} ${url} -> ${handlers.map(handlerMapper)}`);
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

    private log(message: string) {
        if (this.debug) {
            this.debug(message);
        }
    }
}
