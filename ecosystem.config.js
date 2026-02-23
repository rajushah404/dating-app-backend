module.exports = {
    apps: [
        {
            name: 'maya-dating-backend',
            script: 'server.js',
            instances: 'max', // Use maximum CPU cores
            exec_mode: 'cluster', // Enable cluster mode
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
