# Gas Station — průzkum a závěr pro návrh

Datum: 30. září 2026. Původní výzkumný podklad pro třetí hru. Po schválení vznikla implementace popsaná v [README.md](README.md).

## Co jsme ověřili

Zdrojem jsou popisy vydavatelů v oficiálních obchodech. Dokládají nabízené mechaniky, nikoli jejich kvalitu, výnosnost nebo retenci. Hry jsme v tomto průzkumu osobně nehráli. Ceny, žebříčky, počty instalací a hodnocení nepoužíváme jako argument pro ekonomiku naší hry.

| Hra a primární zdroj | Co popis výslovně nabízí | Poučení pro náš návrh |
| --- | --- | --- |
| [Gas Station Simulator — DRAGO entertainment, Steam](https://store.steampowered.com/app/1149620/Gas_Station_Simulator/) | Obnova opuštěné stanice, rozšiřování služeb včetně shopu, WC, dílny a myčky; zaměstnanci, sklad a objednávání zásob i paliva. | Stanice poskytuje několik navazujících zdrojů příjmů. Vlastní dodávky a úzká místa dají řízení obsah i po odemčení pump. |
| [Gas Station Inc. — Lion Studios, Google Play](https://play.google.com/store/apps/details?id=com.gamestart.hypergasstation3d) | Krátké úlohy obsluhy, tankování, volba paliva, mytí aut a postup do dalších úrovní. | První akce musí být pochopitelná bez dlouhého vysvětlení. Ruční obsluha má mít jasnou animaci a okamžitý výsledek. |
| [Gas Station: Junkyard Tycoon — Homa, Google Play](https://play.google.com/store/apps/details?id=gas.station.idle&hl=en_US) | Úklid a přestavba zanedbané stanice, tankování, opravy aut, shop, myčka a vylepšování vybavení. | Viditelná změna plochy dobře ukazuje postup. Pro náš rozsah stačí rozšiřovat jednu čitelnou mapu. |
| [Idle Gas Station Tycoon — Lime Games, Google Play](https://play.google.com/store/apps/details?id=com.limegames.idlegas) | Osobní auta a trucky, prodej občerstvení a dalšího sortimentu, rozšiřování parkování, offline hraní; také výzkum, prestiž a mimozemská odbočka. | Různé typy vozidel a pobyt na parkovišti mohou propojit palivo s obchodem. Náš koncept může zůstat tematicky soustředěný na cestování. |
| [Roadside Empire: Idle Tycoon — Highcore Labs, Google Play](https://play.google.com/store/apps/details?id=com.hybridparking.game&hl=en-US) | Růst malé stanice, personál, další lokace, myčka, opravna, nabíjení, WC, sprchy, prádelna a více druhů občerstvení. | Samotný seznam služeb včetně sprch není nový. Rozdíl musí vytvořit jejich vzájemná závislost a způsob hraní. |

## Doporučený koncept

Pracovní název **Next Stop — Gas Station**: útulná silniční zastávka, kterou hráč promění z jedné pumpy ve fungující truck stop. Hráč se pohybuje přímo po stylizovaném 3D areálu, zprvu obsluhuje, doplňuje regály a uklízí; postupně práci přebírá viditelný tým.

Hlavní návrhová hypotéza: hráče bude bavit zlepšovat celou návštěvu řidiče, nikoli pouze násobit výnos pumpy. Auto natankuje a uvolní stojan; řidič zaparkuje, koupí nápoj, využije čisté WC a odjede spokojený. Truck má větší nákup paliva, delší pobyt, vlastní parkovací místo a zájem o teplé jídlo a sprchu. Lepší zázemí přináší větší poptávku po dalších službách, ale také nároky na zásoby a úklid.

To je náš návrh, nikoli doložená mezera na trhu nebo tvrzení, že konkurence žádnou takovou vazbu nemá. Před implementací ekonomiky se ověří malým hratelným prototypem.

## Co převzít jako princip

- Malý první úkol a rychlá první tržba; pak vždy jedno viditelné rozšíření.
- Zřetelný přechod ruční práce na automatizaci, která se pozdějším upgradem nezruší.
- Omezené fronty a skutečně obsazené stojany, parkovací místa a služby.
- Viditelná proměna stanice: větší střecha, nové pruhy, regály, osvětlené zázemí.
- Více cest ke zlepšení výkonu: kratší obsluha, větší zásoby, další parkování nebo čistší zázemí.

## Hranice první verze

Jedna kompletní mapa, dvě kategorie provozu (osobní auta a trucky), šest vývojových fází, dvanáct rozšíření, shop, káva a hot dog, WC a sprchy. Myčka, servis, nabíjení, motel a další lokace patří do zásobníku dalších verzí; první verze je má v návrhu kapacitně umožnit, ale nesmí kvůli nim stavět obecný editor podniků.

Přínos nekončí chybějící službou v konkurenčním seznamu: stojí na srozumitelném toku vozidel, příjemném mobilním ovládání a poctivé, dokončitelné progresi. Reklamy, placené násobiče, náhodné placené odměny, časově omezené nabídky a ztráta řady za vynechaný den nejsou součástí zadání.

## Co průzkum neprokazuje

Neznáme skutečnou délku návštěvy, retenci, marže, náklady na získání hráče ani výkon konkurence na cílovém telefonu. Cílové časy a ekonomické konstanty v [SPEC.md](SPEC.md) jsou testovatelné hypotézy. Grafiku, názvy značek, mapy, UI ani texty konkurence nepřebíráme.
