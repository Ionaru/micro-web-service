import { BaseRouter } from '..';

export class NotFoundRoute extends BaseRouter {

    public constructor() {
        super();
        this.createRoute('all', '*', NotFoundRoute.notFound);
    }
}
