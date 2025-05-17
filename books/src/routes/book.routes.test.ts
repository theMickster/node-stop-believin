import { bookRoutes } from "@routes/book.routes";

describe('bookRoutes', () => {
  let router: ReturnType<typeof bookRoutes>;

  beforeEach(() => {
    router = bookRoutes();
  });

  const getRoutesFromRouter = () => router.stack.filter((layer: any) => layer.route);

  it("should register correct routes", () => {
    const routes = getRoutesFromRouter();
    expect(routes.length).toBe(5);

    const getRoute = routes.find(x => 
        x.route?.path === '/' && 
        x.route?.stack?.some((layer: any) => layer.method === 'get'));

    const postRoute = routes.find(x => 
        x.route?.path === '/' && 
        x.route?.stack?.some((layer: any) => layer.method === 'post'));        

    const getByIdRoute = routes.find(x => 
        x.route?.path === '/:id' && 
        x.route?.stack?.some((layer: any) => layer.method === 'get'));  

    const updateByIdRoute = routes.find(x => 
        x.route?.path === '/:id' && 
        x.route?.stack?.some((layer: any) => layer.method === 'put'));  

    const deleteByIdRoute = routes.find(x => 
        x.route?.path === '/:id' && 
        x.route?.stack?.some((layer: any) => layer.method === 'delete'));  

    expect(getRoute).toBeDefined();
    expect(postRoute).toBeDefined();
    expect(getByIdRoute).toBeDefined();
    expect(updateByIdRoute).toBeDefined();
    expect(deleteByIdRoute).toBeDefined();        
  });
    
});
