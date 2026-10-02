# Kompletní změna UI Benzinky — 1. října 2026

## Průzkum

Prohlédnuty oficiální screenshoty App Store a popisy her. Nejde o osobní hraní konkurence ani měření jejich retence.

| Zdroj | Pozorování | Rozhodnutí pro Next Stop |
| --- | --- | --- |
| [Gas Station Simulator Tycoon / Homa](https://apps.apple.com/us/app/gas-station-simulator-tycoon/id6737841009) | Screenshoty ukazují prostorový provoz přes většinu obrazovky, malý stav peněz a úrovně, úkol poblíž akce a značky nad objekty. | Celoplošný areál, kompaktní HUD, značky navázané na skutečnou pumpu/službu. |
| [My Mini Mart / Supersonic](https://apps.apple.com/us/app/my-mini-mart/id1592004814) | Screenshoty staví na jasných barevných pracovních zónách, objektech a postavě. Popis zmiňuje zásoby, výrobu a zaměstnance. | Běžné hraní nezahlcovat správou. Správu otevřít cíleným tlačítkem a po úkolu vrátit hráče do provozu. |
| [Idle Gas Station Tycoon / Lime Games](https://play.google.com/store/apps/details?id=com.limegames.idlegas) | Popis zahrnuje auta, trucky, obchod, rozšiřování a další manažerské systémy. | Nabídku správy rozdělit podle záměru: rozšíření, tým/vylepšení, zásoby, denní úkoly. Nevystavovat všechny systémy trvale. |

Závěry pro vlastní UI jsou návrhové úsudky, nikoli prokázaný vliv těchto principů na úspěšnost hry. Nepřebíráme cizí grafiku, texty ani rozložení jako přesnou kopii.

## Problém předchozího řešení

Trvalý pravý sloupec a široká horní lišta dělily pozornost mezi hru a administrativu. Obě nabídky rozšíření byly pod sebou s opakovanými investičními bloky. Poslední změna kamery a barev tento strukturální problém neodstranila.

## Realizovaný směr

Celoplošná herní plocha. Vlevo nahoře kompaktní značka s postupem 0–12, vpravo žlutá peněženka. Samostatný tmavý panel ukazuje přesné aktuální a maximální zásoby paliva, diesel a nesený náklad. Dole je čtveřice velkých herních tlačítek. Aktuální úkol zůstává přímo na herní ploše.

Správa je zavřená při vstupu. Na desktopu se otevírá plovoucí okno, na telefonu spodní panel. Za ním se herní obraz jemně ztlumí. Obě rozšíření jsou vedle sebe s piktogramem, názvem, investovanou částkou, cenou a akcí. Zavření je dostupné křížkem, klepnutím mimo panel, opakovaným tlačítkem v docku a Escape. Klávesnice při správě nepohybuje postavou.

Paleta: tmavá modř #17364B, herní modrá #087CBD, peněžní žlutá #FFCE45, bílá #FFFFFF, povrch #F7FBFF, světle modrá #D4EEFB. Písmo Trebuchet MS se systémovými fallbacky; žádné síťové fonty. Siluety prvků, bílé hrany a krátké stíny oddělují UI od 3D scény. Barva není jediným nositelem významu: zůstávají názvy, hodnoty a stavy tlačítek.

Simulace, ceny, kolize, uložené hry a jazyky zůstávají kompatibilní. Změny jsou v GasStation main.ts, style.css a výpočtu zakrytí popisků v scene.ts; společná ani sesterská hra se nemění.

## Ověření

Kontrola typů a produkční build prošly. Všech 17 dotčených browserových scénářů prošlo po opravách (15 v prvním souhrnném běhu, 2 opravené scénáře v samostatném běhu; následně znovu 4/4 rozložení včetně Escape). Ověřena obsluha pumpy, chůze k obchodu, placené dodávky, nouzový úvěr, financování rozšíření, reload, offline start, mobilní vstup, dotyková dostupnost značek, čeština a arabština, portrait 390×844 a landscape 844×390. Screenshoty jsou v docs/screenshots/ui-overhaul-*.png. Fyzický telefon nebyl ověřen.


Dodatečná vizuální oprava landscape: kompaktní ilustrace a odstranění opakovaného záhlaví umožňují zobrazit obě investiční tlačítka ihned bez rolování. Nová kontrola ověřuje jejich úplnou viditelnost; landscape 1/1 PASS (9,5 s), ostatní rozložení 3/3 PASS. Finální build prošel.

