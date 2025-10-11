import { bookRoutes } from "@routes/book.routes";
import { RouterLayer, isRouteLayer, hasMethod } from "@libs/types/expressRouterTypes";

describe('bookRoutes', () => {
  let router: ReturnType<typeof bookRoutes>;

  beforeEach(() => {
    router = bookRoutes();
  });

  const getRoutesFromRouter = () => {
    const stack = router.stack as RouterLayer[];
    return stack.filter(isRouteLayer);
  };

  it("should register correct routes", () => {
    const routes = getRoutesFromRouter();
    expect(routes.length).toBe(5);

    const getRoute = routes.find(x =>
        x.route.path === '/' &&
        x.route.stack?.some(layer => hasMethod(layer, 'get')));

    const postRoute = routes.find(x =>
        x.route.path === '/' &&
        x.route.stack?.some(layer => hasMethod(layer, 'post')));

    const getByIdRoute = routes.find(x =>
        x.route.path === '/:id' &&
        x.route.stack?.some(layer => hasMethod(layer, 'get')));

    const updateByIdRoute = routes.find(x =>
        x.route.path === '/:id' &&
        x.route.stack?.some(layer => hasMethod(layer, 'put')));

    const deleteByIdRoute = routes.find(x =>
        x.route.path === '/:id' &&
        x.route.stack?.some(layer => hasMethod(layer, 'delete')));

    expect(getRoute).toBeDefined();
    expect(postRoute).toBeDefined();
    expect(getByIdRoute).toBeDefined();
    expect(updateByIdRoute).toBeDefined();
    expect(deleteByIdRoute).toBeDefined();
  });
    
});
