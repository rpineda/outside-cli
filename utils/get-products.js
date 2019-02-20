pool = require('./database');

module.exports = async () => {

    //Validate SKU exist
    let query = "SELECT a.id, a.codigo, a.descripcion, a.existencia, tag, clasificacion_id, '' as wholesales "
    query += "FROM producto a "
    query += "LIMIT 5"

    let products = await pool.query(query)

    if (products.length > 0) {

        for(const [key, value] of Object.entries(products)) {

            let query = "SELECT p.price, p.name, p.is_default "
            query += "FROM producto_precios p "
            query += "WHERE p.product_id = "+value.id+" "
            query += "ORDER BY p.is_default DESC"

            const wholeprices = await pool.query(query);

            products[key].wholesales = wholeprices;

        }

    }

    return products
}
