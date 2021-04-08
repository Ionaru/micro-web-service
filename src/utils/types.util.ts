import { Request as ExpressRequest } from 'express';
// eslint-disable-next-line import/no-unresolved
import { Query } from 'express-serve-static-core';

export type Unsure<T = unknown> = {
    [K in keyof T]: unknown;
};

export type Params<T> = {
    [K in keyof T]?: string;
};

export type Request<P = unknown, B = unknown> = ExpressRequest<Params<P>, unknown, Unsure<B> | unknown[], Query>;
