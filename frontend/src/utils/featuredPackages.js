// Shared selection/ordering rule for homepage hero packages. Navbar's package
// links point at `package-${slug}` anchors that FeaturedPackages renders, so
// both must agree on which services count as packages and in what order.
export const getFeaturedPackages = (services = []) =>
  services
    .filter((svc) => svc.featured)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
