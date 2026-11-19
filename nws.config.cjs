const path = require('path');

// Local config to serve the Vite bundle (dist) the same way the VPS serves the deployed build.
module.exports = {
  fileLogPath: false,
  portHttp: 8080,
  portHttps: 8443,
  statsDomain: false,
  servers: [
    {
      hostname: 'localhost',
      protocol: 'http',
      type: 'worker',
      options: {
        root: path.resolve(__dirname, 'dist'),
        cwd: path.resolve(__dirname),
      },
    },
  ],
};
