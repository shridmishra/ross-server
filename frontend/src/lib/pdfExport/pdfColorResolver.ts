const oklchCache = new Map<string, string>();

export const convertOklchToRgb = (colorStr: string): string => {
    if (oklchCache.has(colorStr)) {
        return oklchCache.get(colorStr)!;
    }
    try {
        if (typeof document === "undefined") return "rgb(0, 0, 0)";
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "rgb(0, 0, 0)";
        ctx.fillStyle = colorStr;
        const resolved = ctx.fillStyle;
        oklchCache.set(colorStr, resolved);
        return resolved;
    } catch (e) {
        return "rgb(0, 0, 0)";
    }
};

export const resolveColorFunctions = (value: any): any => {
    if (typeof value !== "string") return value;
    if (!value.includes("oklch") && !value.includes("oklab") && !value.includes("lab") && !value.includes("lch") && !value.includes("color-mix")) {
        return value;
    }
    // Match color-mix(...) with up to one level of nested parens, or bare oklch/oklab/lab/lch
    const pattern = /(color-mix\((?:[^()]+|\([^()]*\))*\)|(oklch|oklab|lab|lch)\([^)]+\))/g;
    return value.replace(pattern, (match) => {
        return convertOklchToRgb(match);
    });
};

const styleProxyCache = new WeakMap<any, any>();
export const getStyleProxy = (style: any): any => {
    if (!style) return style;
    if (styleProxyCache.has(style)) return styleProxyCache.get(style);

    const proxy = new Proxy(style, {
        get(target, prop, receiver) {
            if (prop === "getPropertyValue") {
                return function(propertyName: string) {
                    const val = target.getPropertyValue(propertyName);
                    return resolveColorFunctions(val);
                };
            }
            let val = Reflect.get(target, prop);
            if (typeof val === "function") {
                return val.bind(target);
            }
            if (typeof val === "string") {
                return resolveColorFunctions(val);
            }
            return val;
        }
    });
    styleProxyCache.set(style, proxy);
    return proxy;
};

const ruleCache = new WeakMap<any, any>();
export const getProxyRule = (rule: any): any => {
    if (!rule) return rule;
    if (ruleCache.has(rule)) return ruleCache.get(rule);

    const proxy = new Proxy(rule, {
        get(target, prop, receiver) {
            if (prop === "cssText") {
                try {
                    const originalText = target.cssText;
                    return resolveColorFunctions(originalText);
                } catch (e) {
                    let val = Reflect.get(target, prop);
                    if (typeof val === "function") return val.bind(target);
                    return val;
                }
            }
            if (prop === "style") {
                return getStyleProxy(target.style);
            }
            if (prop === "cssRules") {
                try {
                    const rules = target.cssRules;
                    if (!rules) return rules;
                    const filteredRules: any[] = [];
                    for (let i = 0; i < rules.length; i++) {
                        filteredRules.push(getProxyRule(rules[i]));
                    }
                    const ruleList: any = {
                        length: filteredRules.length,
                        item(index: number) { return filteredRules[index]; },
                        [Symbol.iterator]() {
                            let i = 0;
                            return {
                                next() {
                                    return i < filteredRules.length
                                        ? { value: filteredRules[i++], done: false }
                                        : { done: true };
                                }
                            };
                        }
                    };
                    filteredRules.forEach((rule, idx) => {
                        ruleList[idx] = rule;
                    });
                    if (typeof CSSRuleList !== "undefined") {
                        Object.setPrototypeOf(ruleList, CSSRuleList.prototype);
                    }
                    return ruleList;
                } catch (e) {
                    // fallback
                }
            }
            let val = Reflect.get(target, prop);
            if (typeof val === "function") {
                return val.bind(target);
            }
            return val;
        }
    });
    ruleCache.set(rule, proxy);
    return proxy;
};

let exportLock = false;
export const acquireExportLock = async (): Promise<boolean> => {
    for (let i = 0; i < 50; i++) {
        if (!exportLock) {
            exportLock = true;
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
};

export const releaseExportLock = () => {
    exportLock = false;
};
