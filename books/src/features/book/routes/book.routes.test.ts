import { RouterLayer, isRouteLayer, hasMethod } from '@libs/types/expressRouterTypes';

import { bookRoutes } from './book.routes';

describe('bookRoutes', () => {
  let router: ReturnType<typeof bookRoutes>;

  beforeEach(() => {
    router = bookRoutes();
  });

  const getRoutesFromRouter = () => {
    const stack = router.stack as RouterLayer[];
    return stack.filter(isRouteLayer);
  };

  it('should register correct routes', () => {
    const routes = getRoutesFromRouter();
    expect(routes.length).toBe(9);

    const getRoute = routes.find(
      (x) => x.route.path === '/' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    const postRoute = routes.find(
      (x) => x.route.path === '/' && x.route.stack?.some((layer) => hasMethod(layer, 'post')),
    );

    const getByIdRoute = routes.find(
      (x) => x.route.path === '/:id' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    const updateByIdRoute = routes.find(
      (x) => x.route.path === '/:id' && x.route.stack?.some((layer) => hasMethod(layer, 'put')),
    );

    const deleteByIdRoute = routes.find(
      (x) => x.route.path === '/:id' && x.route.stack?.some((layer) => hasMethod(layer, 'delete')),
    );

    const publishRoute = routes.find(
      (x) => x.route.path === '/:id/publish' && x.route.stack?.some((layer) => hasMethod(layer, 'post')),
    );

    const updatePublicationRoute = routes.find(
      (x) => x.route.path === '/:id/publication' && x.route.stack?.some((layer) => hasMethod(layer, 'patch')),
    );

    const classifyPostRoute = routes.find(
      (x) => x.route.path === '/:id/classify' && x.route.stack?.some((layer) => hasMethod(layer, 'post')),
    );

    const classifyPutRoute = routes.find(
      (x) => x.route.path === '/:id/classify' && x.route.stack?.some((layer) => hasMethod(layer, 'put')),
    );

    expect(getRoute).toBeDefined();
    expect(postRoute).toBeDefined();
    expect(getByIdRoute).toBeDefined();
    expect(updateByIdRoute).toBeDefined();
    expect(deleteByIdRoute).toBeDefined();
    expect(publishRoute).toBeDefined();
    expect(updatePublicationRoute).toBeDefined();
    expect(classifyPostRoute).toBeDefined();
    expect(classifyPutRoute).toBeDefined();
  });

  it('should register publish book route with POST method', () => {
    const routes = getRoutesFromRouter();
    const publishRoute = routes.find(
      (x) => x.route.path === '/:id/publish' && x.route.stack?.some((layer) => hasMethod(layer, 'post')),
    );

    expect(publishRoute).toBeDefined();
    expect(publishRoute?.route.path).toBe('/:id/publish');
    expect(publishRoute?.route.methods?.post).toBe(true);
  });

  it('should register update publication route with PATCH method', () => {
    const routes = getRoutesFromRouter();
    const updatePublicationRoute = routes.find(
      (x) => x.route.path === '/:id/publication' && x.route.stack?.some((layer) => hasMethod(layer, 'patch')),
    );

    expect(updatePublicationRoute).toBeDefined();
    expect(updatePublicationRoute?.route.path).toBe('/:id/publication');
    expect(updatePublicationRoute?.route.methods?.patch).toBe(true);
  });

  it('should register classify book route with POST method', () => {
    const routes = getRoutesFromRouter();
    const classifyRoute = routes.find(
      (x) => x.route.path === '/:id/classify' && x.route.stack?.some((layer) => hasMethod(layer, 'post')),
    );

    expect(classifyRoute).toBeDefined();
    expect(classifyRoute?.route.path).toBe('/:id/classify');
    expect(classifyRoute?.route.methods?.post).toBe(true);
  });

  it('should register update classification route with PUT method', () => {
    const routes = getRoutesFromRouter();
    const updateClassificationRoute = routes.find(
      (x) => x.route.path === '/:id/classify' && x.route.stack?.some((layer) => hasMethod(layer, 'put')),
    );

    expect(updateClassificationRoute).toBeDefined();
    expect(updateClassificationRoute?.route.path).toBe('/:id/classify');
    expect(updateClassificationRoute?.route.methods?.put).toBe(true);
  });
});
