const React = require("react");

const Fragment = React.Fragment;

function renderChildren(children) {
  return React.createElement(Fragment, null, children);
}

function MemoryRouter({ children }) {
  return renderChildren(children);
}

function BrowserRouter({ children }) {
  return renderChildren(children);
}

function Routes({ children }) {
  return renderChildren(children);
}

function Route({ element = null }) {
  return element;
}

function createBrowserRouter(routes = []) {
  return { routes };
}

function RouterProvider({ router }) {
  if (!router || !Array.isArray(router.routes)) {
    return null;
  }

  const indexRoute = router.routes.find((route) => route.index);
  if (indexRoute && indexRoute.element) {
    return indexRoute.element;
  }

  const rootRoute = router.routes.find((route) => route.path === "/" || route.path === undefined);
  if (rootRoute && rootRoute.element) {
    return rootRoute.element;
  }

  return null;
}

module.exports = {
  MemoryRouter,
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
};
