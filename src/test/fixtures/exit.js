'use strict';

const throng = require('../../lib/throng');

throng({
  workers: 3,
  lifetime: 0,
  start: () => {
    console.log('worker');
    process.exit();
  }
});
