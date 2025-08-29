module.exports = {
  apps: [
    {
      name: 'web',
      // Use Next.js binary directly to avoid subshells
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        // Change the port if needed
        PORT: process.env.PORT || '3000'
      },
      // Cluster mode to use all available CPU cores
      exec_mode: 'cluster',
      instances: 'max',
      // Do not watch in production
      watch: false,
      max_memory_restart: '1G',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
