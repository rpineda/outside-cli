pool = require('./database');

module.exports = async (key, value, params) => {

    //Validate SKU exist
    var query = "SELECT a.id, a.codigo, a.existencia "
    query += "FROM producto a "
    query += "WHERE a.codigo = '" + value.codigo + "' "

    const prdExists = await pool.query(query)
    if (prdExists.length == 0) {
        if (value.existencia > 0) {

            query = "INSERT INTO producto SET "
            query = query + "sucursal = '', "
            query = query + "codigo = '" + value.codigo + "', "
            query = query + "descripcion = '" + value.descripcion + "', "
            query = query + "existencia = '" + value.existencia + "', "
            query = query + "precio = '" + value.precio + "', "
            query = query + "precio_cliente = '" + value.precio + "', "
            query = query + "tag = '" + params.category.name + "', "
            query = query + "clasificacion_id = '" + params.category.id + "';"
            resultQuery = await pool.query(query)

            if (resultQuery != undefined) {

                let price = (params.wholesale.name=='MAYORISTA')? (value.precio/1.15): value.precio

                query = "INSERT INTO producto_precios SET "
                query += "product_id = " + resultQuery.insertId + ", "
                //query += "price = " + value.precio + ", "
                query += "price = " + price + ", "
                query += "name = 'WHOLESALE-" + params.wholesale.name + "', "
                query += "is_default = " + params.wholesale.is_default + "; "
                resultQuery = await pool.query(query)

            }

        }
    } else {
        const stock = prdExists[0].existencia
        const id = prdExists[0].id

        if (stock != value.existencia) {

            let updateQuery =  "UPDATE producto "
            updateQuery += "SET existencia = "+value.existencia+" "
            updateQuery += "WHERE codigo = '"+value.codigo+"'; "
            await pool.query(updateQuery);

        }

        let sqlPPrice = "SELECT * "
        sqlPPrice += "FROM producto_precios "
        sqlPPrice += "WHERE product_id = " + id + " "
        sqlPPrice += "AND name = 'WHOLESALE-" + params.wholesale.name + "'; "
        const pPrdExists = await pool.query(sqlPPrice)

        if (pPrdExists.length == 0) {
            let price = (params.wholesale.name=='MAYORISTA')? (value.precio/1.15): value.precio

            query = "INSERT INTO producto_precios SET "
            query += "product_id = " + id + ", "
            //query += "price = " + value.precio + ", "
            query += "price = " + price + ", "
            query += "name = 'WHOLESALE-" + params.wholesale.name + "', "
            query += "is_default = " + params.wholesale.is_default + "; "
            resultQuery = await pool.query(query)

        } else {
            let price = (params.wholesale.name=='MAYORISTA')? (value.precio/1.15): value.precio

            let updateQuery = "UPDATE producto_precios "
            //updateQuery += "SET price = " + value.precio + " "
            updateQuery += "SET price = " + price + " "
            updateQuery += "WHERE product_id = " + id + " "
            updateQuery += "AND name = 'WHOLESALE-" + params.wholesale.name + "'; "
            resultQuery = await pool.query(updateQuery)

        }
    }

    return true
}
