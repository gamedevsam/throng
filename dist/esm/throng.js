import cluster from 'node:cluster';
import os from 'node:os';
import defaultsDeep from 'lodash.defaultsdeep';
const nCPU = os.cpus().length;
const defaults = {
    primary: () => { },
    count: nCPU,
    lifetime: Infinity,
    grace: 5000,
    signals: ['SIGTERM', 'SIGINT']
};
export async function throng(options, legacy) {
    const config = defaultsDeep({}, parseOptions(options, legacy), defaults);
    const { primary, worker, workerCreated } = config;
    if (typeof worker !== 'function') {
        throw new Error('Start function required');
    }
    if (cluster.isWorker) {
        return await worker(cluster.worker.id, disconnect);
    }
    const reviveUntil = Date.now() + config.lifetime;
    let running = true;
    listen();
    await primary();
    fork(config.count, workerCreated);
    function listen() {
        cluster.on('disconnect', revive);
        config.signals.forEach((signal) => process.on(signal, shutdown(signal)));
    }
    function shutdown(signal) {
        return () => {
            running = false;
            setTimeout(() => forceKill(signal), config.grace).unref();
            Object.values(cluster.workers).forEach((worker) => {
                worker.process.kill(signal);
            });
        };
    }
    function revive() {
        if (!running)
            return;
        if (Date.now() >= reviveUntil)
            return;
        const worker = cluster.fork();
        workerCreated?.(worker);
    }
    function forceKill(signal) {
        Object.values(cluster.workers).forEach((worker) => worker.kill(signal));
        process.exit();
    }
}
function fork(n, workerCreated) {
    for (var i = 0; i < n; i++) {
        const worker = cluster.fork();
        workerCreated?.(worker);
    }
}
// Queue the disconnect for a short time in the future.
// Node has some edge-cases with child processes that this helps with -
// Unlike main processes, child processes do not exit immediately once no async ops are pending.
// However, calling process.exit() exits immediately, even if async I/O (like console.log/stdout/piping to a file) is pending.
// Instead of using process.exit(), you can disconnect the worker, after which it will die just like a normal process.
// In practice, disconnecting directly after I/O can cause EPIPE errors (https://github.com/nodejs/node/issues/29341)
// I dislike adding arbitrary delays to the system, but 50ms here has eliminated flappy test failures.
function disconnect() {
    setTimeout(() => cluster.worker.disconnect(), 50);
}
// Once upon a time,
// options could be startFn, options object, or worker count
// and startFunction could be startFn or options object.
// (whew - what a bad idea!)
function parseOptions(options = {}, startFunction) {
    if (typeof options === 'function') {
        return { worker: options };
    }
    if (typeof options === 'number') {
        return { count: options, worker: startFunction };
    }
    return {
        primary: options.primary,
        worker: options.worker || options.start,
        workerCreated: options.workerCreated,
        count: options.count !== undefined ? options.count : options.workers,
        lifetime: options.lifetime,
        grace: options.grace,
        signals: options.signals
    };
}
export default throng;
//# sourceMappingURL=throng.js.map