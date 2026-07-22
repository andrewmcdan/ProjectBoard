export class RedirectError extends Error {
    constructor(url) {
        super(`Redirected to ${url}`);
        this.url = url;
    }
}

export function form(values = {}) {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) {
        for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
    }
    return data;
}
