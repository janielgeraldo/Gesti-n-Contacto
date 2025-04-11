const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Agregar Contacto', function () {
  this.timeout(30000); // Aumenta el tiempo de espera total

  it('debería completar el formulario y tomar captura', async function () {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
      await driver.get('http://127.0.0.1:5500/index.html');

      await driver.wait(until.elementLocated(By.id('addDemoModal')), 10000)
        .then(async (element) => {
          await driver.wait(until.elementIsNotVisible(element), 10000);
        }).catch(() => {
          console.log('El modal de demostración no está visible.');
        });

      const botonNuevo = await driver.wait(until.elementLocated(By.css('[data-bs-target="#contactModal"]')), 10000);
      await driver.executeScript("arguments[0].click();", botonNuevo);

      const modal = await driver.wait(until.elementLocated(By.id('contactModal')), 10000);
      await driver.wait(until.elementIsVisible(modal), 10000);

      const campos = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+34 600 111 222',
        company: 'Empresa Ejemplo',
        jobTitle: 'Desarrollador',
        address: 'Calle Falsa 123',
        city: 'Madrid',
        country: 'España',
        notes: 'Agregado por test automatizado.'
      };

      for (const [id, valor] of Object.entries(campos)) {
        const input = await driver.wait(until.elementLocated(By.id(id)), 10000);
        await driver.wait(until.elementIsVisible(input), 5000);
        await driver.wait(until.elementIsEnabled(input), 5000);
        await input.clear();
        await input.sendKeys(valor);
      }

      const screenshotDir = path.resolve(__dirname);
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync(path.join(screenshotDir, 'formulario_completado.png'), screenshot, 'base64');

      // Validación simple para incluir un assert
      const inputNombre = await driver.findElement(By.id('firstName'));
      const valorNombre = await inputNombre.getAttribute('value');
      assert.strictEqual(valorNombre, 'Juan');

    } catch (err) {
      console.error('Error en prueba:', err);
      throw err;
    } finally {
      await driver.quit();
    }
  });
});