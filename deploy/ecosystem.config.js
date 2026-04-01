module.exports = {
  apps: [
    {
      name: 'briket-berry-api',
      script: './backend/dist/index.js',
      cwd: '/var/www/briket-berry',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_file: '/var/www/briket-berry/backend/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/briket-berry-error.log',
      out_file: '/var/log/pm2/briket-berry-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
