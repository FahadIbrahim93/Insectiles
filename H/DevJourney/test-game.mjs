import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    const t = msg.text();
    if (msg.type() === 'error') errors.push(t);
    else if (msg.type() === 'log') console.log('[LOG]', t);
  });

  try {
    console.log('Navigating to game...');
    await page.goto('http://192.168.0.101:5173', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const body = await page.textContent('body');
    console.log('HAS_START:', body.includes('START'));
    
    await page.getByRole('button', { name: 'START' }).click();
    await page.waitForTimeout(1500);
    
    const body2 = await page.textContent('body');
    console.log('HAS_MANTIS:', body2.includes('Mantis'));
    
    await page.getByRole('button', { name: 'Mantis' }).click();
    await page.waitForTimeout(1000);
    
    const body3 = await page.textContent('body');
    console.log('HAS_NORMAL:', body3.includes('NORMAL'));
    
    await page.getByRole('button', { name: 'NORMAL' }).click();
    await page.waitForTimeout(4000);
    
    const body4 = await page.textContent('body');
    console.log('HAS_HUD:', body4.includes('WAVE') || body4.includes('HP'));
    
    const canvases = await page.locator('canvas').count();
    console.log('CANVAS_COUNT:', canvases);
    
    const pixiDiv = await page.locator('#pixi-container').count();
    console.log('PIXI_DIV:', pixiDiv);
    
    const pixiDivHtml = await page.locator('#pixi-container').innerHTML().catch(() => 'NOT FOUND');
    console.log('PIXI_DIV_HTML_LEN:', pixiDivHtml.length);
    console.log('PIXI_DIV_HTML:', pixiDivHtml.substring(0, 200));
    
    console.log('ERRORS:', JSON.stringify(errors));
    
  } catch (e) {
    console.log('TEST_ERROR:', e.message);
  }
  
  await browser.close();
})();
