import {chromium} from "../../RestaurantCommon/node_modules/playwright-core/index.mjs";
import {mkdir} from "node:fs/promises";
await mkdir(new URL("../docs/screenshots/",import.meta.url),{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true});
for(const [name,width,height]of [["desktop",1440,1000],["mobile",390,844]]){
const page=await browser.newPage({viewport:{width,height},locale:"cs-CZ"});
page.on("pageerror",e=>console.log("PAGE ERROR",e.message));
await page.goto("http://localhost:4175");await page.waitForTimeout(1500);
await page.screenshot({path:new URL("../docs/screenshots/"+name+".png",import.meta.url).pathname.replace(/^\/([A-Z]:)/,"$1")});
console.log(name,await page.locator("#money").textContent(),await page.locator("body").evaluate(e=>e.scrollWidth));
const payload=await page.evaluate(async()=>{const m=await import('/src/simulation.ts');const s=m.createGame();s.level=12;s.autoSupply=true;s.money=1250;for(let i=0;i<1000;i++)m.step(s,.1);return m.encode(s);});
await page.locator('[data-action=settings]').click();await page.locator('#import-file').setInputFiles({name:'capture.json',mimeType:'application/json',buffer:Buffer.from(payload)});await page.waitForTimeout(1200);if(name==='mobile')await page.locator('[data-action=overview]').click();await page.screenshot({path:new URL('../docs/screenshots/'+name+'-complete.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});await page.close();}
await browser.close();
