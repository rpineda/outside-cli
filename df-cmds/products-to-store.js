const ora = require('ora')
const axios = require('axios')
const fs = require('fs');
const getProducts = require('../utils/get-products')

module.exports = async (args) => {
    const spinner = ora()

    var accessData = fs.readFileSync('access_token.json', 'utf-8');
    accessData = JSON.parse(accessData);

    const apiRequestUrl = 'https://' + accessData.shop + '/admin/products.json';
    const apiRequestHeader = {
        'X-Shopify-Access-Token': accessData.access_token
    };

    try {
        spinner.start()

        const products = await getProducts()

        for (const [key, value] of Object.entries(products)){

            const tagLiquidacion = (value.precio >= 25 && value.precio <= 100)? 'LIQUIDACION' : '';

            let variants = [];
            let option_values = ["Default"];
            for (const [wkey, wvalue] of Object.entries(value.wholesales)) {

                let wname = wvalue.name.split('-');
                option_values.push(wname[1]);

                if(wvalue.is_default) {
                    variants.push({
                        title: 'Default',
                        price: wvalue.price,
                        sku: value.codigo,
                        inventory_policy: 'deny',
                        fulfillment_service: 'manual',
                        inventory_management: 'shopify',
                        option1: 'Default',
                        inventory_quantity: value.existencia
                    })
                }

                variants.push({
                    title: wname[1],
                    price: wvalue.price,
                    sku: value.codigo,
                    inventory_policy: 'deny',
                    fulfillment_service: 'manual',
                    inventory_management: null,
                    option1: wname[1],
                    inventory_quantity: 0
                })

            }

            let productPayload = {
                product: {
                    title: value.descripcion.toUpperCase(),
                    body_html: value.descripcion.toLowerCase(),
                    vendor: 'MA-SA',
                    product_type: value.tag,
                    tags: value.tag + ","+ tagLiquidacion,
                    published: true,
                    published_scope: 'global',
                    options: [
                        {
                            name: 'Wholesale',
                            values: option_values
                        }
                    ],
                    variants: variants
                }

            };

            const apiResponse = await axios({
                method: 'post',
                url: apiRequestUrl,
                data: productPayload,
                headers: apiRequestHeader
            })

            console.log(apiResponse);

        }

        spinner.stop()

        console.log('All products has been pulled on shopify')

    } catch (err) {
        spinner.stop()

        console.error(err)
    }
}