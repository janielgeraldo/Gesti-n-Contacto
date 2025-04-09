const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

async function testMarcarFavorito() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://127.0.0.1:5500/index.html');

        
        await driver.wait(until.elementLocated(By.css('.favorite-btn')), 5000);

        
        const favButton = await driver.findElement(By.css('.favorite-btn'));
        await favButton.click(); 

        
        await driver.sleep(5000);


        const screenshot = await driver.takeScreenshot();
        const filePath = path.join(__dirname, 'captura_favorito.png');
        fs.writeFileSync(filePath, screenshot, 'base64');
        console.log(`Captura guardada en: ${filePath}`);

    } catch (error) {
        console.error('Error durante la prueba:', error);
    } finally {
        await driver.quit();
    }
}

testMarcarFavorito();
