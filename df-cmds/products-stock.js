const ora = require('ora')
const getWeather = require('../utils/weather')
const getStock = require('../utils/stock')
const addProduct = require('../utils/add-product')
const fs = require('fs')

module.exports = async (args) => {
    const spinner = ora()

    const start_global = new Date()
    const wholesales = [
        //{id: 3, name: 'DEFAULT'},
        {id: 2, name: 'MAYORISTA', is_default: false},
        {id: 3, name: 'MINORISTA', is_default: true},
        //{id: 4, name: 'OFERTA'}
    ]
    const categories = [
        {id: 1,  name: 'Accesorios'},
        {id: 2,  name: 'Celulares'},
        {id: 3,  name: 'Estuches'},
        {id: 4,  name: 'Repuestos'},
        {id: 11, name: 'Go Pro'},
        {id: 13, name: 'Grip Clip'},
        {id: 10, name: 'Otros'},
        {id: 11, name: 'Protectores de Pantalla'},
    ]

    const xmlEnvelopeFile = fs.readFileSync('utils/envelopes/getProductosEnvelope.xml', 'utf-8');

    try {

        for(const [ckey, cvalue] of Object.entries(categories)){
            spinner.start();

            let start = new Date();
            for(const [wkey, wvalue] of Object.entries(wholesales)) {
                let params = {
                    wholesale: wvalue,
                    category: cvalue,
                }

                let xmlEnvelope = xmlEnvelopeFile;
                xmlEnvelope = xmlEnvelope
                    .replace('{wholesale}', params.wholesale.id)
                    .replace('{category}', params.category.id);

                const stock = await getStock(xmlEnvelope)
                for (const [key, value] of Object.entries(stock.data_groups)) {
                    const is_added = await addProduct(key, value, params)
                }
            }

            let end = new Date() - start
            let time = new Date(end)
            let ago = (time/60000) //convert to minutes

            spinner.stop()
            console.log(cvalue.name+' has imported in %d minutes', Math.round(ago.toFixed(2)))
        }

        spinner.stop()

        let end_global = new Date() - start_global
        let time = new Date(end_global);
        let ago = (time/60000) //convert to minutes

        console.info('All categories has imported in %d minutes', Math.round(ago.toFixed(2)))
    } catch (err) {
        spinner.stop()

        console.error(err)
    }
}
