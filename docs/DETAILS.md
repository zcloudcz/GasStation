# Next Stop — Gas Station

Hratelná 3D hra pro mobilní i desktopový browser. Z jedné pumpy vzniká stanice pro osobáky i trucky, shop, občerstvení a čisté zázemí. Samostatný projekt; nástroje a malé pomocné moduly sdílí s RestaurantCommon.

## Spuštění

Vyžaduje Node.js 22.12+ a WebGL 2. Zachovej sourozenecké složky GasStation a RestaurantCommon. Jednorázově v RestaurantCommon spusť `npm ci`, potom v GasStation:

```powershell
npm run dev
npm test
npm run build
npm run preview
```

Dev i běžný preview používají http://localhost:4175. Pro souběžný preview použij `node ../RestaurantCommon/scripts/serve.mjs gas --preview --port 4185`. Telefon ve stejné síti může použít adresu Network vypsanou serverem.

Build v GasStation/dist lze samostatně publikovat na statický HTTPS hosting, i do podadresáře. PWA a offline spuštění potřebují HTTPS/localhost a dokončené první online načtení. Obyčejná LAN HTTP adresa slouží pouze pro vyzkoušení hry.

## Obsah

- Šest fází, 12 rozšíření, částečné financování, závěr a pokračování po dokončení.
- Auta a trucky, kompatibilní stojany a parkování, řízené průjezdy, řidiči chodící mezi službami.
- Dva typy paliva, sklad a objednávky; později automatická logistika.
- Šest kategorií shopu s vlastními zásobami a čistým výnosem: voda, snacky, cestovní potřeby, péče o auto, potřeby řidičů, suvenýry.
- Káva a hot dogy se vstupními zásobami a časovanou přípravou.
- WC/sprchy: kvalita, čistota, obsazenost a znovuotevření až po kompletním úklidu.
- Šest profesí, šest upgrade řad, tři vzhledy postavy, denní cíle.
- Vlastní procedurální 3D modely, animace, nesené zásoby, zvuky, úsporná grafika a pauza.
- Dvacet jazyků, automatická volba browseru, ruční přepnutí, arabské RTL.
- Autosave, export/import, potvrzovaný reset, ochrana nečitelné zálohy a omezený offline výnos.

Bez účtu, reklam, plateb, vzdálené analytiky a externích modelů/fontů za běhu.

## Ovládání

WASD/šipky nebo tažení prstu. Klepnutí na štítek služby postavu dovede na místo. Ruční pohyb, otevření panelu, pauza a ztráta fokusu automatickou cestu ruší. Zaměřovač přepíná sledování postavy a přehled stanice.

U pumpy stáním v obslužné zóně zahájíš tankování. Ve skladu vyzvedneš krabice a u služby je automaticky vyložíš. WC/sprchu uklízíš stáním poblíž, pokud není obsazená. Zaměstnanci tyto úkoly postupně přebírají.

Panel **Služby** ukazuje palivo, regály, přípravu jídla, hygienu a cenovou nabídku dodávky. Palivo, diesel i zásobovací krabice stojí 1 minci za jednotku. Před objednáním vidíš množství, celkovou cenu a zbývající hotovost. Platba proběhne jednou při objednání; za 24 sekund přijde přesně objednaný náklad. Při nízkém rozpočtu nabídka zmenší dodávku. Kliknutí na sklad otevře nabídku a tlačítko pro vyzvednutí zásob.

Počáteční zásoby jsou součástí nové hry. Při nulové hotovosti a méně než 4 jednotkách automobilového paliva je dostupných 8 jednotek nouzového paliva na bezúročný úvěr; 8 mincí se automaticky splatí z dalších tržeb. Nový úvěr nelze čerpat před splacením. Automatická logistika používá stejná pravidla a platí z volných peněz. Prodej připisuje hrubou tržbu (auto 16, truck 64 mincí), nákupní náklad se podruhé neodečítá. Offline odměna vychází z čistého přírůstku hotovosti po zaplacení dodávek.

Uložení používá `next-stop:save:v1`, preference `next-stop:preferences`. Nečitelné či budoucí uložení se automaticky nepřepisuje. Ochranu ukončí platný import nebo výslovný reset.

## Ověření a dokumentace

V RestaurantCommon spusť `npm run typecheck` a `npm run test:e2e`; před browserovými testy sestav všechny hry. Vlastní GasStation testy spouští `npm test`.

[Výsledky a omezení](VALIDATION.md) · [Původ grafiky](ASSETS.md) · [Zadání](../SPEC.md) · [Průzkum konkurence](../RESEARCH.md)

Dvacet simulačních průchodů s kolizemi chodců: 47,54–49,78 minuty. Nejde o měření lidské zábavnosti či retence. Fyzický Android/iPhone a nativní obchody nebyly ověřeny. Myčka, servis, nabíjení, motel a další mapy patří do případných dalších verzí.

![Dokončená stanice](screenshots/desktop-complete.png)



## Nové herní rozhraní

Celoplošný areál, plovoucí HUD a spodní nabídka; správa se otevírá až na vyžádání. Dvě rozšíření lze porovnat vedle sebe. Panel zavřeš křížkem, klepnutím mimo něj nebo Escape. [Průzkum a návrh UI](UI-REDESIGN-2026-10-01.md).

