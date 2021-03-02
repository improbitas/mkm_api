import levenshtein from './levenshtein.js';

const toKey = (val) => {
    return val?.toLowerCase().replace(/[^a-z0-9]/ig, '');
}

const getClosestMatch = (name, meta) => {
    let expectedName = toKey(name);

    let exact = meta.filter(x => toKey(x.metaproduct.enName) === expectedName)[0];
    if (exact) {
        return exact;
    }

    let leven = [];
    for (let item of meta) {
        leven.push({
            item: item,
            dist: levenshtein(expectedName, toKey(item.metaproduct.enName))
        });
    }

    leven.sort((a,b) => a.dist > b.dist ? 1 : -1);
    return leven[0].item;
}

const getProductBySetName = (item, products) => {
    let expectedSet = toKey(item.setName);

    let exact = products.filter(x => toKey(x.expansionName) === expectedSet)[0];
    if (exact) {
        return exact;
    }

    let leven = [];
    for (let item of products) {
        leven.push({
            item: item,
            dist: levenshtein(expectedSet, toKey(item.expansionName))
        });
    }

    leven.sort((a,b) => a.dist > b.dist ? 1 : -1);
    return leven[0].item;
}

const matchProduct = (item, meta) => {
    let result = {
        id: null,
        warnings: [],
        errors: [],
        status: 'ok'
    };
    
    if (meta.length == 0) {
        result.status = 'error';
        result.errors.push({ key: 'name', value: 'no results' });
        return result;
    }

    var match = getClosestMatch(item.name, meta);

    if (match.metaproduct.enName !== item.name) {
        result.status = 'warning';
        result.warnings.push({ key: 'Name', value: 'not exact match', alt: meta.map(x => x.metaproduct.enName) });
    }

    var product = getProductBySetName(item, match.product);
    result.id = product.idProduct;

    if (product.expansionName !== item.setName) {
        result.status = 'warning';
        result.setName = product.expansionName;
        result.warnings.push({ key: 'Set', value: 'Not exact match', alt: match.product.map(x => x.expansionName) });
    }

    return result;
}

export default matchProduct;