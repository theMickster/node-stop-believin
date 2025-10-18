import { authorRoutes } from './author.routes';
import { RouterLayer, isRouteLayer, hasMethod } from '@libs/types/expressRouterTypes';

describe('authorRoutes', () => {
  let router: ReturnType<typeof authorRoutes>;

  beforeEach(() => {
    router = authorRoutes();
  });

  const getRoutesFromRouter = () => {
    const stack = router.stack as RouterLayer[];
    return stack.filter(isRouteLayer);
  };

  it('should register correct routes', () => {
    const routes = getRoutesFromRouter();
    expect(routes.length).toBe(2);

    const getRoute = routes.find(
      (x) => x.route.path === '/' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    const getByIdRoute = routes.find(
      (x) => x.route.path === '/:id' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    expect(getRoute).toBeDefined();
    expect(getByIdRoute).toBeDefined();
  });

  it('should register get all authors route with GET method', () => {
    const routes = getRoutesFromRouter();
    const getRoute = routes.find(
      (x) => x.route.path === '/' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    expect(getRoute).toBeDefined();
    expect(getRoute?.route.path).toBe('/');
    expect(getRoute?.route.methods?.get).toBe(true);
  });

  it('should register get author by id route with GET method', () => {
    const routes = getRoutesFromRouter();
    const getByIdRoute = routes.find(
      (x) => x.route.path === '/:id' && x.route.stack?.some((layer) => hasMethod(layer, 'get')),
    );

    expect(getByIdRoute).toBeDefined();
    expect(getByIdRoute?.route.path).toBe('/:id');
    expect(getByIdRoute?.route.methods?.get).toBe(true);
  });

  it('should have authentication middleware on all routes', () => {
    const routes = getRoutesFromRouter();

    routes.forEach((route) => {
      const middlewareCount = route.route.stack?.length ?? 0;
      expect(middlewareCount).toBeGreaterThanOrEqual(3);
    });
  });

  it('should register routes in the correct order', () => {
    const routes = getRoutesFromRouter();

    // First route should be GET /
    expect(routes[0].route.path).toBe('/');
    expect(routes[0].route.methods?.get).toBe(true);

    // Second route should be GET /:id
    expect(routes[1].route.path).toBe('/:id');
    expect(routes[1].route.methods?.get).toBe(true);
  });
});
