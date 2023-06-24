/// <reference types="node" />
import { Worker } from 'node:cluster';
export interface ThrongOptions {
    /**
     * Fn to call in primary process (can be async)
     */
    primary?: Function;
    /**
     * Fn to call in cluster workers (can be async)
     */
    worker?: Function;
    /**
     * Fn to call when a worker is created (can be async)
     */
    workerCreated?: (worker: Worker) => void;
    /**
     * Number of workers (defaults to os.cpus().length)
     */
    count?: number;
    /**
     * Min time to keep cluster alive (ms)
     */
    lifetime?: number;
    /**
     * Grace period between signal and hard shutdown (ms)
     */
    grace?: number;
    /**
     * Signals that trigger a shutdown (proxied to workers)
     */
    signals?: ('SIGTERM' | 'SIGINT')[];
    /**
     * Fn to call in cluster workers (can be async)
     * @deprecated
     */
    start?: Function;
    /**
     * Number of workers
     * @deprecated
     */
    workers?: number;
}
export declare function throng(options: ThrongOptions, legacy?: Function): Promise<any>;
export default throng;
