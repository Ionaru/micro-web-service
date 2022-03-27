import Ajv, { ErrorObject, JSONSchemaType, ValidateFunction } from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import { Debugger } from 'debug';
import { RequestHandler, Response } from 'express';

import { BaseRouter } from '../routers/base.router';

export abstract class AjvValidationRoute extends BaseRouter {

    protected readonly ajv: Ajv;

    protected constructor(debug?: Debugger, add = true) {
        super(debug);
        this.ajv = new Ajv({ allErrors: true });
        if (add) {
            ajvErrors(this.ajv);
            ajvFormats(this.ajv);
        }
    }

    protected static getErrorDetails(errors?: ErrorObject[] | null): Array<[string, string]> {
        if (!errors || !errors.length) {
            return [['Unknown', 'Unknown']];
        }

        const errorDetails: Array<[string, string]> = [];

        for (const error of errors) {
            const property = error.instancePath;
            const message = error.message;
            errorDetails.push([property, message || 'Invalid']);
        }

        return errorDetails;
    }

    protected static sendValidationError(response: Response, validator: ValidateFunction): Response {
        const [property, message] = AjvValidationRoute.getErrorDetails(validator.errors)[0];
        return AjvValidationRoute.sendBadRequest(response, property, message);
    }

    protected static renderValidationError(response: Response, validator: ValidateFunction, handler: RequestHandler): void {
        const errors = AjvValidationRoute.getErrorDetails(validator.errors);

        if (!response.locals.errors) {
            response.locals.errors = [];
        }

        for (const [property, message] of errors) {
            response.locals.errors.push(`${property}: ${message}`);
        }

        return handler(response.req, response, () => undefined);
    }

    protected static validate<T>(input: unknown, validator: ValidateFunction<T>, response: Response, sendError = true): input is T {
        if (validator(input)) {
            return true;
        }
        if (sendError) {
            AjvValidationRoute.sendValidationError(response, validator);
        }
        return false;
    }

    protected createValidateFunction<T>(schema: JSONSchemaType<T>): ValidateFunction<T> {
        return this.ajv.compile<T>(schema);
    }
}
