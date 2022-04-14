# @ionaru/micro-web-service

## Description
A library with tools to quickly create an express server.

## Usage
```
npm install @ionaru/micro-web-service ajv ajv-errors ajv-formats
npm install -D @types/body-parser @types/compression @types/express @types/express-serve-static-core
```

```js
export class ExampleRouter extends BaseRouter {

    // request: express.Request
    // response: express.Response
    // next: express.NextFunction

    static badHandler(request, response, next) {
        ExampleRouter.sendResponse(response, 400, 'Bad');
    }

    static okHandler(request, response, next) {
        ExampleRouter.sendSuccess(response);
    }

    static dataHandler(request, response, next) {
        ExampleRouter.sendSuccess(response, {value: 5});
        // Data can be anything.
        // Responds {data: {value: 5}, message: 'OK', state: 'success'}
    }

    constructor() {
        super();

        this.createRoute('get', '/bad', ExampleRouter.badHandler);
        this.createRoute('get', '/ok', ExampleRouter.okHandler.bind(this)); // Bind class context.
        this.createRoute('get', '/data', ExampleRouter.dataHandler);
    }
}

const router = new ExampleRouter();
const serviceController = new ServiceController({
    port: 3000,
    routes: [
        ['/', router],
    ],
}).listen().then();

// Close the webserver
serviceController.close().then();
```
