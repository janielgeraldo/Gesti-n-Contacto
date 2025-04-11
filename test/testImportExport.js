const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
const moment = require('moment');

describe('Prueba del botón de exportación', function() {
    let driver;

    // Setup: inicialización del driver antes de cada prueba
    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    // Cleanup: cerrar el driver después de cada prueba
    after(async function() {
        await driver.quit();
    });

    // La prueba en sí
    it('Debería cargar la página correctamente y hacer clic en el botón de exportación', async function() {
        const startTime = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(`[INICIO] Prueba comenzada a las: ${startTime}`);
        
        try {
            // Abrir la página en el navegador
            await driver.get('http://127.0.0.1:5500/index.html'); 

            // Esperar a que el modal sea visible
            const modal = await driver.wait(until.elementIsVisible(driver.findElement(By.id('importExportModal'))), 10000);
            console.log('Modal visible.');

            // Esperar a que el botón de exportación sea visible y habilitado
            const exportButton = await driver.wait(until.elementIsVisible(driver.findElement(By.id('exportBtn'))), 10000);
            await driver.wait(until.elementIsEnabled(exportButton), 10000);
            console.log('Botón de exportación visible y habilitado.');

            try {
                // Intentar hacer clic en el botón de exportación
                await exportButton.click();
                console.log('Botón de exportación clickeado.');
            } catch (error) {
                console.log('Error haciendo clic con el método normal, intentando con JavaScript...');
                await driver.executeScript('arguments[0].click();', exportButton);
                console.log('Botón de exportación clickeado usando JavaScript.');
            }

            // Captura de pantalla después de hacer clic
            console.log('Tomando captura de pantalla...');
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync('export_button_click.png', image, 'base64');
                console.log('Captura de pantalla tomada.');
            });

            // Asegurar que la captura fue tomada correctamente
            assert(fs.existsSync('export_button_click.png'), 'La captura de pantalla no fue guardada correctamente.');

            const endTime = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(`[FIN] Prueba terminada a las: ${endTime}`);

            console.log('----- REPORTE DE PRUEBA -----');
            console.log(`Resultado: Exitosa`);
            console.log(`Inicio: ${startTime}`);
            console.log(`Fin: ${endTime}`);

        } catch (error) {
            console.error('Error durante la prueba:', error);
            assert.fail('La prueba falló: ' + error.message);
        }
    });
});
