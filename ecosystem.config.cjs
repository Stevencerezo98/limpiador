module.exports = {
  apps: [
    {
      name: 'cleanmail-app',
      script: 'node',
      args: 'server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        APP_DOMAIN: 'cleanmail.uno.my',
        LANDING_DOMAIN: 'unio.my'
      }
    }
  ]
};
