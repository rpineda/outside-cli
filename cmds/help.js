const menus = {
  main: `
    df-shopify-sync [command] <options>

    products-stock ....................... get stock of products from Webservice
    products-image ....................... get images of product from Webservice
    products-to-store .................... put product to shopify store
    product-images-to-store .............. put images of product to shopify store
    today ................................ show weather for today
    forecast ............................. show 10-day weather forecast
    version .............................. show package version
    help ................................. show help menu for a command`,

  today: `
    df-shopify-sync today <options>

    --location, -l ..... the location to use`,

  forecast: `
    df-shopify-sync forecast <options>

    --location, -l ..... the location to use`,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
