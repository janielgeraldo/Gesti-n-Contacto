const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

async function testAgregarContacto() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://127.0.0.1:5500/index.html');

  
    await driver.wait(until.elementLocated(By.id('addDemoModal')), 10000)
      .then(async (element) => {
        await driver.wait(until.elementIsNotVisible(element), 10000);
      }).catch(() => {
        console.log('El modal de demostración no está visible.');
      });

    // Ahora, buscar y hacer clic en el botón para abrir el modal de contacto
    const botonNuevo = await driver.wait(until.elementLocated(By.css('[data-bs-target="#contactModal"]')), 10000);
    await driver.wait(until.elementIsVisible(botonNuevo), 10000);

    // Usar JavaScriptExecutor para hacer clic en el botón, en caso de que haya un bloqueo
    await driver.executeScript("arguments[0].click();", botonNuevo);

    // Esperar visibilidad del modal de contacto
    const modal = await driver.wait(until.elementLocated(By.id('contactModal')), 10000);
    await driver.wait(until.elementIsVisible(modal), 10000);
    await driver.sleep(5000); 

    // Asegurarse de que los campos de entrada sean interactuables
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
      console.log(`📝 Llenando campo: ${id}`);
      
      // Esperar hasta que el campo sea interactuable
      const input = await driver.wait(until.elementLocated(By.id(id)), 10000); 
      await driver.wait(until.elementIsVisible(input), 5000); 
      await driver.wait(until.elementIsEnabled(input), 5000); 

      // Interactuar con el campo
      await input.clear();
      await input.sendKeys(valor);
    }

    
    const screenshotDir = path.resolve(__dirname);
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(path.join(screenshotDir, 'formulario_completado.png'), screenshot, 'base64');


  } catch (err) {
    console.error('Error:', err);
  } finally {
    await driver.quit();
  }
}

testAgregarContacto();
