const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');

(async function testExportButton() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
       
        await driver.get('http://127.0.0.1:5500/index.html'); 

      
        const modal = await driver.wait(until.elementIsVisible(driver.findElement(By.id('importExportModal'))), 10000);
        console.log('Modal visible.');

        const exportButton = await driver.wait(until.elementIsVisible(driver.findElement(By.id('exportBtn'))), 10000);
        await driver.wait(until.elementIsEnabled(exportButton), 10000);
        console.log('Botón de exportación visible y habilitado.');

       
        try {
            await exportButton.click();
            console.log('Botón de exportación clickeado.');
        } catch (error) {
          
            console.log('Error haciendo clic con el método normal, intentando con JavaScript...');
            await driver.executeScript('arguments[0].click();', exportButton);
            console.log('Botón de exportación clickeado usando JavaScript.');
        }

        // Captura de pantalla después de hacer clic
        await driver.takeScreenshot().then(function(image) {
            fs.writeFileSync('export_button_click.png', image, 'base64');
            console.log('Captura de pantalla tomada.');
        });

       
        await driver.sleep(2000);  

    } catch (error) {
        console.error('Error durante la prueba:', error);
    } finally {
        await driver.quit();  // Cerrar el navegador después de la prueba
    }
})();
