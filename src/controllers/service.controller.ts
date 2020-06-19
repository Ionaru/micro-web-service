import { WebServer } from '@ionaru/web-server';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
// eslint-disable-next-line import/no-unresolved
import { ErrorRequestHandler, PathParams, RequestHandler } from 'express-serve-static-core';

import { BaseRouter, RequestLogger } from '..';
import { debug } from '../debug';

export interface IRoute {
    0: PathParams;
    1: BaseRouter;
}

export interface IOption {
    0: string;
    1: any;
}

interface IConstructorParams {
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

    public constructor(
        {
            errorRouter,
            middleware = [
                RequestLogger.logRequest(),
                bodyParser.json(),
                bodyParser.urlencoded({extended: true}),
                compression(),
            ],
            options = [],
            port,
            routes,
            staticPaths = [],
        }: IConstructorParams,
    ) {

        debug('Beginning Express startup');
        this.expressApplication = express();
        debug('Express application constructed');

        debug('Setting options');
        options.forEach((option) => this.expressApplication.set(option[0], option[1]));

        debug('Adding middleware');
        middleware.forEach((handler) => this.expressApplication.use(handler));

        debug('Adding static paths');
        staticPaths.forEach((path) => this.expressApplication.use(express.static(path)));

        debug('Adding routes');
        routes.forEach((route) => this.expressApplication.use(route[0], route[1].router));

        if (errorRouter) {
            debug('Error router added');
            this.expressApplication.use(errorRouter);
        }

        debug('Express configuration set');
        debug('App startup done');

        this.webServer = new WebServer(this.expressApplication, port);
    }

    public async listen(): Promise<void> {
        return this.webServer.listen();
    }

    public async close(): Promise<void> {
        return this.webServer.close();
    }
}
