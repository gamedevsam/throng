"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throng = void 0;
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = __importDefault(require("node:os"));
const lodash_defaultsdeep_1 = __importDefault(require("lodash.defaultsdeep"));
const nCPU = node_os_1.default.cpus().length;
const defaults = {
    primary: () => { },
    count: nCPU,
    lifetime: Infinity,
    grace: 5000,
    signals: ['SIGTERM', 'SIGINT']
};
async function throng(options, legacy) {
    const config = (0, lodash_defaultsdeep_1.default)({}, parseOptions(options, legacy), defaults);
    const { primary, worker, workerCreated } = config;
    if (typeof worker !== 'function') {
        throw new Error('Start function required');
    }
    if (node_cluster_1.default.isWorker) {
        return await worker(node_cluster_1.default.worker.id, disconnect);
    }
    const reviveUntil = Date.now() + config.lifetime;
    let running = true;
    listen();
    await primary();
    fork(config.count, workerCreated);
    function listen() {
        node_cluster_1.default.on('disconnect', revive);
        config.signals.forEach((signal) => process.on(signal, shutdown(signal)));
    }
    function shutdown(signal) {
        return () => {
            running = false;
            setTimeout(() => forceKill(signal), config.grace).unref();
            Object.values(node_cluster_1.default.workers).forEach((worker) => {
                worker.process.kill(signal);
            });
        };
    }
    function revive() {
        if (!running)
            return;
        if (Date.now() >= reviveUntil)
            return;
        const worker = node_cluster_1.default.fork();
        workerCreated?.(worker);
    }
    function forceKill(signal) {
        Object.values(node_cluster_1.default.workers).forEach((worker) => worker.kill(signal));
        process.exit();
    }
}
exports.throng = throng;
function fork(n, workerCreated) {
    for (var i = 0; i < n; i++) {
        const worker = node_cluster_1.default.fork();
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
    setTimeout(() => node_cluster_1.default.worker.disconnect(), 50);
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
exports.default = throng;
//# sourceMappingURL=throng.js.map