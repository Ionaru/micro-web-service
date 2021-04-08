import Ajv, { ErrorObject, JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Debugger } from 'debug';
import { Response } from 'express';

import { BaseRouter } from '../routers/base.router';

export abstract class AjvValidationRoute extends BaseRouter {

    protected readonly ajv: Ajv;

    protected constructor(debug?: Debugger, add = true) {
        super(debug);
        this.ajv = new Ajv();
        if (add) {
            addFormats(this.ajv);
        }
    }

    protected static getErrorDetails(errors?: ErrorObject[] | null): [string, string] {
        if (!errors || !errors.length) {
            return ['Unknown', 'Unknown'];
        }

        const error = errors[0];
        const property = error.instancePath;
        const message = error.message;

        return [property, message || 'Invalid'];
    }

    protected static sendValidationError(response: Response, validator: ValidateFunction): Response {
        const [property, message] = AjvValidationRoute.getErrorDetails(validator.errors);
        return AjvValidationRoute.sendBadRequest(response, property, message);
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
