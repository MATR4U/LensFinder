export async function* fetchPaged(urlBuilder, fetchImpl = fetch) {
    let page = 1;
    while (true) {
        const url = urlBuilder(page);
        const res = await fetchImpl(url);
        if (!res.ok)
            break;
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        if (!items.length)
            break;
        for (const it of items)
            yield it;
        const hasMore = data.nextPage || (Array.isArray(data) && items.length > 0);
        if (!hasMore)
            break;
        page += 1;
    }
}
export function schemaToDataset(openapi, path) {
    return { fields: [] };
}
export function paramsToSpec(openapi, path, params) {
    return {};
}
