import { WebServer } from '@ionaru/web-server';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { Debugger } from 'debug';
import * as express from 'express';
// eslint-disable-next-line import/no-unresolved
import { ErrorRequestHandler, PathParams, RequestHandler } from 'express-serve-static-core';

import { BaseRouter, RequestLogger } from '..';

export interface IRoute {
    0: PathParams;
    1: BaseRouter;
}

export interface IOption {
    0: string;
    1: any;
}

interface IConstructorParams {
    debug?: Debugger;
    errorRouter?: ErrorRequestHandler;
    middleware?: RequestHandler[];
    options?: IOption[];
    port: number;
    routes: IRoute[];
    staticPaths?: string[];
}

export class ServiceController {

    public readonly webServer: WebServer;
    public readonly expressApplication: express.Application;

    private readonly debug?: Debugger;

    public constructor(
        {
            debug,
            errorRouter,
            middleware,
            options = [],
            port,
            routes,
            staticPaths = [],
        }: IConstructorParams,
    ) {
        this.debug = debug ? debug.extend(this.constructor.name) : debug;

        if (!middleware) {
            middleware = [
                new RequestLogger(this.debug).getLogger(),
                ...ServiceController.getStandardMiddleware(),
            ];
        }

        this.log('Beginning Express startup');
        this.expressApplication = express();
        this.log('Express application constructed');

        if (options?.length) {
            this.log('Setting options:');
            options.forEach((option) => {
                this.log(`- ${option[0]}`);
                this.expressApplication.set(option[0], option[1]);
            });
        }

        this.log('Adding middleware:');
        middleware.forEach((handler) => {
            this.log(`- ${handler.name}`);
            this.expressApplication.use(handler);
        });

        if (staticPaths?.length) {
            this.log('Adding static paths:');
            staticPaths.forEach((path) => {
                this.log(`- ${path}`);
                this.expressApplication.use(express.static(path));
            });
        }

        if (routes.length) {
            this.log('Adding routes:');
            routes.forEach((route) => {
                this.log(`- ${route[0]} -> ${route[1].constructor.name}`);
                this.expressApplication.use(route[0], route[1].router);
            });
        }

        if (errorRouter) {
            this.log('Error router added');
            this.expressApplication.use(errorRouter);
        }

        this.log('Express configuration set');
        this.log('App startup done');

        this.webServer = new WebServer(this.expressApplication, port, this.debug);
    }

    /**
     * Contains:
     * - `bodyParser.json()`
     * - `bodyParser.urlencoded({extended: true})`
     * - `compression()`
     */
    public static getStandardMiddleware(): RequestHandler[] {
        return [
            bodyParser.json(),
            bodyParser.urlencoded({extended: true}),
            compression(),
        ];
    }

    public async listen(): Promise<void> {
        return this.webServer.listen();
    }

    public async close(): Promise<void> {
        return this.webServer.close();
    }

    private log(message: string): void {
        if (this.debug) {
            this.debug(message);
        }
    }
}
