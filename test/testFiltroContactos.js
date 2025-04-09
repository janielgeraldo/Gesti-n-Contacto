const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs'); 
const path = require('path'); 

async function testSearchFilter() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Abre la app
        await driver.get('http://127.0.0.1:5500/index.html');

        // Espera hasta que el campo de búsqueda esté disponible
        await driver.wait(until.elementLocated(By.id('searchInput')), 5000);

        // Escribe un término de búsqueda
        const searchBox = await driver.findElement(By.id('searchInput'));
        await searchBox.sendKeys('laura');

        // Espera a que se actualicen los resultados
        await driver.sleep(5000); 

        // Captura de pantalla de los resultados
        const screenshot = await driver.takeScreenshot();
        const fileName = path.join(__dirname, 'captura_resultados_busqueda.png'); 
        fs.writeFileSync(fileName, screenshot, 'base64');
        console.log(`Captura de pantalla guardada en: ${fileName}`);

        // Captura los resultados filtrados (ajusta selector según tu HTML)
        const results = await driver.findElements(By.css('.contact-card'));
        console.log(`Se encontraron ${results.length} resultados`);

        // Opcional: imprimir contenido de cada resultado
        for (let result of results) {
            const text = await result.getText();
            console.log(text);
        }

    } catch (error) {
        console.error(error);

        // Captura de pantalla en caso de error
        const screenshot = await driver.takeScreenshot();
        const fileName = path.join(__dirname, 'captura_error.png');
        fs.writeFileSync(fileName, screenshot, 'base64');
        console.log(`Captura de pantalla (error) guardada en: ${fileName}`);
    } finally {
        await driver.quit();
    }
}

testSearchFilter();
