const path = require('path');

module.exports = {
  hostname: 'chris.koro.si', //defines what host to provide the instance for
  protocol: 'http', //defines what protocol to use. http/https
  type: 'worker',
  options: {
    root: path.resolve(__dirname, 'build'),
    cwd: path.resolve(__dirname),
    limit: 0,
    limitPerPath: 1,
    index: [
      'index.js'
    ]
  },
};
