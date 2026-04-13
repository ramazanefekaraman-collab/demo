// data.js – produkter med startlager
const rawProducts = [
    {
        id: "airforce1",
        name: "Air Force 1",
        price: 899,
        description: "Klassisk hvid Nike Air Force 1 – tidløst design og maksimal komfort.",
        image: "https://www.pngarts.com/files/8/Nike-Air-Force-One-Free-PNG-Image.png",
        sizes: [
            { size: "40", stock: 5 }, { size: "41", stock: 3 }, { size: "42", stock: 7 },
            { size: "43", stock: 2 }, { size: "44", stock: 4 }, { size: "45", stock: 1 }
        ]
    },
    {
        id: "airmax95",
        name: "Air Max 95",
        price: 1199,
        description: "Ikonisk Air Max 95 med synlige airbags og retro look.",
        image: "https://www.sneakerjagers.com/_next/image?url=https%3A%2F%2Fstatic.sneakerjagers.com%2Fproducts%2F660x660%2F155797.jpg&w=3840&q=100",
        sizes: [
            { size: "41", stock: 2 }, { size: "42", stock: 8 }, { size: "43", stock: 4 },
            { size: "44", stock: 3 }, { size: "45", stock: 0 }
        ]
    },
    {
        id: "nike-tech",
        name: "Nike Tech Fleece",
        price: 1299,
        description: "Blød og varm Tech Fleece jakke/sæt. Perfekt til streetwear.",
        image: "https://www.nike.qa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dw5226ce9f/nk/60a/d/8/d/2/c/60ad8d2c_8b81_4d45_988e_0f1039b1c6c8.jpg",
        sizes: [
            { size: "S", stock: 6 }, { size: "M", stock: 9 }, { size: "L", stock: 4 },
            { size: "XL", stock: 2 }
        ]
    },
    {
        id: "nike-shox",
        name: "Nike Shox TL",
        price: 1399,
        description: "Futuristisk Shox dæmpning, der giver et energisk bounce.",
        image: "https://karlskicks.dk/cdn/shop/files/NikeShoxTLWhiteMetallicSilverMaxOrange_W_3.png?v=1743357036",
        sizes: [
            { size: "40", stock: 3 }, { size: "41", stock: 5 }, { size: "42", stock: 2 },
            { size: "43", stock: 7 }, { size: "44", stock: 1 }
        ]
    },
    {
        id: "p6000",
        name: "Nike P-6000",
        price: 799,
        description: "Retro-løbesko med mesh og læderoverlays. Let og behagelig.",
        image: "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/f5ff7fcc-0ab8-4883-9dd8-cd2085ba8db0/NIKE+P-6000+PRM.png",
        sizes: [
            { size: "39", stock: 4 }, { size: "40", stock: 6 }, { size: "41", stock: 3 },
            { size: "42", stock: 8 }, { size: "43", stock: 2 }
        ]
    },
    {
        id: "corteiz95",
        name: "Nike Corteiz 95 Green",
        price: 7599,
        description: "Ekstremt limited samarbejde mellem Nike x Corteiz. Sjælden grøn detalje.",
        image: "https://unlimitedcph.dk/cdn/shop/products/nikeairmax95spxcorteizguttagreen.jpg?v=1680179297",
        sizes: [
            { size: "41", stock: 1 }, { size: "42", stock: 2 }, { size: "43", stock: 0 },
            { size: "44", stock: 1 }
        ]
    },
    {
        id: "bubble95",
        name: "Air Max 95 Big Bubble",
        price: 1399,
        description: "Big Bubble udgave med forstærket air-enhed. Ekstra komfort.",
        image: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/bc398f6f-de09-4a49-9c2f-3ffea3d800ca/W+NIKE+AIR+MAX+95+BIG+BUBBLE.png",
        sizes: [
            { size: "42", stock: 5 }, { size: "43", stock: 7 }, { size: "44", stock: 3 },
            { size: "45", stock: 2 }
        ]
    }
];

// Gem lagerdata i localStorage (hvis ikke eksisterer)
function initStock() {
    if (!localStorage.getItem('productStock')) {
        localStorage.setItem('productStock', JSON.stringify(rawProducts));
    }
}
initStock();

// Hent produkter med aktuelle lagertal
function getProducts() {
    return JSON.parse(localStorage.getItem('productStock'));
}

// Gem opdaterede produkter
function saveProducts(products) {
    localStorage.setItem('productStock', JSON.stringify(products));
}

// Opdater lager for et specifikt produkt og størrelse (reducer med 1)
function reduceStock(productId, size) {
    let products = getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        const sizeObj = product.sizes.find(s => s.size === size);
        if (sizeObj && sizeObj.stock > 0) {
            sizeObj.stock--;
            saveProducts(products);
            return true;
        }
    }
    return false;
}

// Admin: opdater lager for en given produkt-id, størrelse og ny værdi
function updateStock(productId, size, newStock) {
    let products = getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        const sizeObj = product.sizes.find(s => s.size === size);
        if (sizeObj) {
            sizeObj.stock = Math.max(0, parseInt(newStock) || 0);
            saveProducts(products);
            return true;
        }
    }
    return false;
}