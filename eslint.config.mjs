import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
