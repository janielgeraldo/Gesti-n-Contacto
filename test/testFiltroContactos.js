const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Filtro por búsqueda de nombre', function () {
  this.timeout(30000); // Ampliamos el tiempo de espera por si hay demoras

  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('Debe buscar un contacto por nombre y mostrar resultados', async () => {
    await driver.get('http://127.0.0.1:5500/index.html');

    const searchInput = await driver.wait(until.elementLocated(By.id('searchInput')), 10000);
    await searchInput.sendKeys('laura');

    await driver.sleep(5000); // Dar tiempo para que se actualicen los resultados

    const resultados = await driver.findElements(By.css('.contact-card'));
    const cantidad = resultados.length;

    if (cantidad > 0) {
      const screenshot = await driver.takeScreenshot();
      const fileName = path.join(__dirname, 'captura_resultados_busqueda.png');
      fs.writeFileSync(fileName, screenshot, 'base64');
    }

    for (let r of resultados) {
      const texto = await r.getText();
      console.log('---\n' + texto);
    }

    assert.ok(cantidad > 0, 'No se encontraron contactos con el nombre buscado');
  });
});