/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-adapters',
      comment: 'domain/ must stay framework-agnostic: no importing adapters/',
      severity: 'error',
      from: { path: '^domain' },
      to: { path: '^adapters' },
    },
    {
      name: 'domain-no-next',
      comment: 'domain/ must not import Next.js',
      severity: 'error',
      from: { path: '^domain' },
      to: { path: '^node_modules/next(/|$)' },
    },
    {
      name: 'domain-no-drizzle',
      comment: 'domain/ must not import Drizzle ORM',
      severity: 'error',
      from: { path: '^domain' },
      to: { path: '^node_modules/drizzle-orm(/|$)' },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
  },
};
