const dotenv = require('dotenv').config();
const soapRequest = require('easy-soap-request')
const xpath = require('xml2js-xpath')
const forwardingAddress = process.env.SERVER_URL; // Replace this with your HTTPS Forwarding address
parseString = require('xml2js').parseString,
    xml2js  = require('xml2js')

module.exports = async (xmlEnvelope) => {
    const url = process.env.WSDL_URL;
    const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
    };

    const {response} = await soapRequest(url, headers, xmlEnvelope);
    const {body, statusCode} = response;

    let xret = {data_groups: []};

    try {
        xml2js.parseString(body, function (err, json) {

            var matches = xpath.find(json, "//NewDataSet");

            var object = matches[0]._x0030_;

            var result = [];
            object.reduce(function(res, value) {
                var qty = value.Existencia[0]*1;
                var price = value.Precio[0]*1;

                if (!res[value.Codigo[0]]) {
                    res[value.Codigo[0]] = { codigo: value.Codigo[0], descripcion: value.Descripcion[0], precio: price, existencia: 0 };
                    result.push(res[value.Codigo[0]])
                }
                res[value.Codigo[0]].existencia += qty;
                return res;
            }, {});

            xret.data_groups = result;
        });
    } catch (e) {
        console.log(e);
    }

    return xret;
}
