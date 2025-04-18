module.exports = {
    apps: [
        {
            name: 'backend',
            script: './dist/main.js',
            instances: 1,
            autorestart: true,
            watch: false,
            env_development: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
