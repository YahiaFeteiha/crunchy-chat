module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: './dist/main.js',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
