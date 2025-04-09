const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs'); 
const path = require('path'); 

async function testFiltroCategoriaYBusqueda() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        
        await driver.get('http://127.0.0.1:5500/index.html');

        // Esperar que el filtro de categoría cargue
        await driver.wait(until.elementLocated(By.id('categoryFilter')), 10000);
        const categorySelect = await driver.findElement(By.id('categoryFilter'));
        await categorySelect.sendKeys('Trabajo'); 

        

        // Esperar resultados (puedes refinar esto con un wait más inteligente)
        await driver.sleep(10000);

        // Obtener los contactos visibles
        const contactosFiltrados = await driver.findElements(By.css('.contact-card'));
        console.log(`Resultados encontrados: ${contactosFiltrados.length}`);

        // Tomar captura de pantalla de los resultados
        if (contactosFiltrados.length > 0) {
            const screenshot = await driver.takeScreenshot();
            const fileName = path.join(__dirname, 'captura_resultados_contacto.png'); 
            fs.writeFileSync(fileName, screenshot, 'base64');
            console.log(`Captura de pantalla guardada en: ${fileName}`);
        }

        for (let contacto of contactosFiltrados) {
            const texto = await contacto.getText();
            console.log('---\n' + texto);
        }

    } catch (error) {
        console.error('Error', error);

        // Captura de pantalla en caso de error
        const screenshot = await driver.takeScreenshot();
        const fileName = path.join(__dirname, 'captura_error.png');
        fs.writeFileSync(fileName, screenshot, 'base64');
        console.log(`Captura de pantalla (error) guardada en: ${fileName}`);
    } finally {
        await driver.quit();
    }
}

testFiltroCategoriaYBusqueda();

