export function defaultsDeep(...args) {
    const [source, override] = args;
    if (typeof source !== 'object') {
        return override ?? source;
    }
    return args.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];
            const pType = Object.prototype.toString.call(pVal);
            const oType = Object.prototype.toString.call(oVal);
            if (pType === '[object Array]' && oType === '[object Array]') {
                prev[key] = pVal.concat(...oVal);
            }
            else if (pType === '[object Object]' && oType === '[object Object]') {
                prev[key] = defaultsDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });
        return prev;
    }, Array.isArray(source) ? [] : {});
}
//# sourceMappingURL=defaultsDeep.js.map