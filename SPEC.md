# Next Stop — Gas Station

Vývojové zadání v0.1 · 30. září 2026 · pracovní název

Tento dokument zachovává návrh třetí hry k Burger Rush a Pizza Piazza. Po jeho schválení vznikla hratelná implementace; aktuální návod a ověřený rozsah jsou v [README.md](README.md). Požadavky uživatele: malá benzinka pro osobáky, růst k truckům, parkování, občerstvení, kvalita WC a sprch, odpovídající shop, mobil a browser, vícejazyčnost. Čísla níže jsou původní návrhové parametry; závěrečné výsledky měření jsou v [docs/VALIDATION.md](docs/VALIDATION.md).

Implementační upřesnění: provozní výnosy UI zobrazuje jako čistou marži bez samostatné účtenkové knihy. Offline režim používá omezenou simulaci a konzervativní extrapolaci udržitelného provozu. Modely služeb tvoří kompaktní otevřené stánky a kabiny; interiérová animace, pára, samostatná prádelna, detailní spotřební materiál a pozorování pěti lidí nejsou implementovaným či ověřeným příslibem. Automatické testy ověřily dvacet seedů, dokončení 46,86–48,20 minuty a hodinovou automatizaci. Fyzické mobily a cílové FPS zůstávají k ověření.

## 1. Zážitek a hlavní odlišnost

Začínáš u jedné pumpy a malého okénka. Po prvních autech přibude druhý stojan, shop a parkoviště. Později vytvoříš pohodlné místo pro rodiny i řidiče trucků: rychle natankují, zaparkují, občerství se a použijí čisté zázemí.

Základní smyčka: **obsloužit → inkasovat čistý výnos → doplnit a uklidit → rozšířit → najmout tým → zlepšit průchodnost**. Důležitá rozhodnutí se týkají celého areálu. Další pumpa nepomůže, pokud po tankování auta nemají kam zaparkovat; kvalitní sprcha nepomůže, když nemá čisté ručníky.

Hra má dvě provázané smyčky:

- Provozní, přibližně 5–30 sekund: natankování, doplnění regálu, hotový hot dog, úklid kabiny.
- Rozvojovou, přibližně 1–5 minut: další služba, zaměstnanec, větší sklad nebo kvalitnější zázemí.

Tempo má být poutavé díky výsledkům práce a novým možnostem. Žádná penalizace návratu, energie, ztráta denní řady ani placené odemčení automatizace.

## 2. První kompletní verze

Jedna dokončitelná lokace u silnice. Na začátku jedna automobilová pumpa; na konci čtyři automobilové pumpy, dva truckové stojany, šest míst pro osobáky, čtyři stání pro trucky, shop se šesti kategoriemi zboží, káva a hot dog, dvě WC kabiny a dvě sprchy. K tomu vlastní postava, šest pracovních rolí, dvanáct rozšíření, upgrady služeb, tři kosmetické varianty, jednoduché denní cíle a závěrečné vyhodnocení.

Cílový průchod první lokací je **35–50 minut aktivní hry**, s možností rozdělit jej do krátkých návštěv. Po dokončení provoz pokračuje; nový průchod vyžaduje potvrzení a nabídku exportu zálohy. Délka je hypotéza pro měření, nikoli hotový výsledek.

Bez backendu a účtu; samostatná PWA, instalace a offline spuštění po načtení. Nativní balíčky pro App Store / Google Play nejsou součástí této verze. Myčka, autoservis, nabíjení, motel, autobusové zájezdy a další lokace tvoří možná rozšíření po ověření jádra.

## 3. Šest fází a dvanáct rozšíření

M = herní mince bez vazby na skutečnou měnu. Ceny jsou výchozí parametry k simulaci. Rozšíření lze splácet po částech; již vložené mince zůstávají uložené. Čas je kumulativní cílový interval od začátku.

| Fáze | Rozšíření, výchozí cena | Nová činnost a vizuální změna | Cílový čas |
| --- | --- | --- | --- |
| 1. První zastávka | Start zdarma; 1: druhá pumpa 24 M; 2: mini shop 60 M | Osobáky, tankování, okénko; voda a snacky. Shop zahrnuje pokladního a dvě provizorní parkovací místa. | 0–4 min |
| 2. Místo na pauzu | 3: čtyři parkovací místa a káva 120 M; 4: dvě základní WC kabiny 240 M | Řidiči přecházejí od stojanu na parkoviště; doplňování kelímků a úklid WC. | 4–9 min |
| 3. Malý tým | 5: zázemí personálu 320 M; 6: teplé občerstvení 500 M | Obsluha pump a uklízeč; kuchař a hot dog. Řidič může spojit několik potřeb v jedné zastávce. | 9–16 min |
| 4. Stanice pro všechny | 7: druhý automobilový ostrůvek 700 M; 8: příjezd pro trucky 1 000 M | Celkem čtyři automobilové pumpy a šest míst pro osobáky; dva dieselové stojany a dvě trucková stání. | 16–25 min |
| 5. Truck stop | 9: první sprcha 1 400 M; 10: odpočinková zóna 2 000 M | Ručníky, sprcha a řidiči na delší pauze; druhá sprcha, čtyři trucková stání a odpočinkové lavičky. | 25–36 min |
| 6. Oblíbená zastávka | 11: sklad a logistika 2 800 M; 12: finální přestavba 4 000 M | Skladník a dispečer dokončí automatizaci. Nová střecha, osvětlení, značení a závěrečná plaketa. | 36–50 min |

Pořadí rozšíření je čitelné a pevné, vylepšení již otevřených služeb si hráč vybírá sám. Zámek ukazuje konkrétní předpoklad. Truckový provoz se spustí až po dokončení příjezdu, kompatibilních stojanů a prvních stání; nikdy dříve.

## 4. Vozidla, řidiči a fronty

**Osobák:** menší odběr paliva a krátký pobyt; může využít shop, kávu, jídlo a WC. Vizuální varianty hatchback, sedan a rodinné kombi používají jednu provozní kategorii.

**Truck:** větší odběr, pomalejší manévrování a delší odpočinek; používá truckový stojan i stání. Může si koupit jídlo, cestovní potřeby a sprchu. Varianty kabiny a návěsu nemění pravidla kolizí.

Každé vozidlo má jedno ID; jeho řidič je navázaná entita, nikoli nový nezávislý zákazník. Plán návštěvy vzniká ze seedovaného generátoru podle odemčených služeb a tří profilů: rychlé tankování, krátká pauza, odpočinek řidiče trucku. Po příjezdu se plán libovolně nepřelosovává.

Stavy vozidla: příjezd → fronta příslušného typu → rezervovaný stojan → tankování → platba za palivo → případné parkování → čekání na řidiče → výjezd. Platba za palivo proběhne u obsluhy/terminálu stojanu, aby dlouhý nákup v shopu neblokoval tankování. Nákup a placené služby mají vlastní jednorázové účtenky.

Před opuštěním stojanu se atomicky rezervuje volné parkování odpovídající délky. Pokud není, vůz vynechá dobrovolné služby a odjede. Nikdy nezůstane stát napříč výjezdem. Zákazník s krátkým tankováním parkování vůbec nepotřebuje. Shop od začátku zahrnuje dvě provizorní místa; rozšíření 3 zvyšuje celkovou kapacitu na čtyři a rozšíření 7 na šest.

Vozidla jedou po předem navržených jednosměrných pruzích. Kritické křižovatky mají rezervaci jednoho průjezdu; dlouhý truck obsadí segment až do projetí návěsu. Hráč auta neřídí a nestaví silnice. Chodci používají vlastní chodníky a přechody.

Tvrdé limity: 12 osobních aut a 6 trucků včetně front a zaparkovaných, nejvýše 18 návštěvníků v areálu. Šest aut a tři trucky smí čekat před vjezdem. Další provoz vizuálně pokračuje po silnici bez vytvoření simulační entity. Přijímání vozidel lze kdykoliv pozastavit, již přijatí zákazníci dokončí návštěvu.

## 5. Palivo a zásobování

Dva oddělené zásobníky: automobilové palivo a diesel pro trucky. Typ je určen stojanem a vozidlem, výběr špatné pistole není minihra. Hráč aktivuje tankování stáním v obslužné zóně; později jej zajistí pracovník. Zásoba se odečítá průběžně pouze za skutečně vydané jednotky.

Výchozí návrh: osobák odebírá 4 jednotky během 8 sekund; truck 16 jednotek během 18 sekund. Základní nádrž pro osobáky má 80 jednotek, trucková 160; upgrady zvyšují objem a výdej. Po vyčerpání zásoby se tankování pozastaví a ukáže důvod, po dodávce naváže na zbylé množství.

Doplnění objedná hráč jedním tlačítkem u skladu. Jedna objednávka na typ může čekat současně. Dodávka trvá orientačně 20–35 sekund aktivního času, přijíždí vlastním servisním vjezdem a nepoužívá zákaznické parkování. Nejprve lze objednávat ručně, po logistickém rozšíření automaticky pod 25 % zásoby. Cílová dodávka = volná kapacita minus již objednané množství.

**Aktualizace podle požadavku na placené objednávky:** palivo, diesel i jedna zásobovací krabice stojí 1 minci. Nabídka před nákupem ukazuje přesné množství, celkovou cenu a hotovost po zaplacení. Cena se odečte jednou při objednání, za 24 sekund přijde pevný objednaný náklad. Při nedostatku hotovosti se nabídka zmenší; další objednávka není možná před příjezdem předchozí. Počáteční zásoby jsou zdarma. Prodejní částky zahrnují nákupní cenu: osobák 16, truck 64 mincí, placené doplňkové služby a kategorie shopu původní čistý výnos + 1. Náklad se při prodeji znovu neodečítá.

Při nulové hotovosti a méně než 4 jednotkách automobilového paliva nabídka poskytne 8 jednotek nouzového paliva na bezúročný úvěr 8 mincí. Dluh se splácí z následujících tržeb; další úvěr je možný až po úplném splacení. Toto pravidlo brání zablokování hry po utracení posledních peněz. Automatická logistika objednává stejnou placenou cestou. Existující rozpracované dodávky ze starší verze se dokončí bez dodatečné platby.

## 6. Shop, jídlo a parkování

Shop má šest postupně odemykaných kategorií:

| Kategorie | První nabídka | Praktická vazba |
| --- | --- | --- |
| Nápoje | voda, později džus | krátká pauza osobáku |
| Balené snacky | krekry, tyčinka | rychlý nákup |
| Cestovní potřeby | ubrousky, nabíjecí kabel | rodinná nebo delší zastávka |
| Auto potřeby | kapalina do ostřikovačů, utěrka | tematický doplňkový prodej |
| Potřeby řidičů | termohrnek, cestovní polštář | poptávka trucků |
| Suvenýry | pohlednice, malý model auta | pozdní kosmeticky výrazný sortiment |

Jedna kategorie má jeden logický typ zásoby, dva zmíněné výrobky jsou vizuální varianty. Hráč přenáší krabice ze skladu do omezených regálů. Objednávky skladu sdílejí pravidla palivové logistiky. Vozík se odemyká jako kapacitní upgrade. Na jednom nákladu se nemíchají potraviny, zásoby úklidu a odpad.

Káva: kelímky do kávovaru → hotové nápoje do malého bufferu → prodej. Hot dog: zásobovací krabice → příprava/ohřev → omezený výdejní pult → prodej. Kuchař převezme přípravu; skladník později vstupy. Nejde o kopii celé burgerové kuchyně uvnitř benzinky.

Parkování je kapacita, ne pouhý výnosový násobič. Osobák po tankování zabere krátkodobé místo; truck delší stání. Pobyt se uvolní teprve návratem řidiče. Výchozí návrh je bez parkovného, aby auta měla srozumitelný jediný důvod zůstávat: využít služby. „Prémiové stání“ je upgrade komfortu se světlem a krytou cestou, ne další platební brána.

## 7. WC a sprchy: dvě odlišné hodnoty

**Kvalita** je trvalá zakoupená úroveň 1–3: jednoduchá kabina → komfortní zařízení → kvalitní zázemí. Zlepšuje ochotu návštěvníků využít službu a dobu obsluhy; vždy mění model, osvětlení a vybavení.

**Čistota** je provozní stav 0–100, klesá po návštěvě. Úroveň kvality sama neodstraní nepořádek. Pod 35 se kabina uzavře pro nové zákazníky, stávající návštěvník službu dokončí. Po úklidu na 100 se znovu otevře. Každá kabina má vlastní stav i frontu.

WC je zdarma a zvyšuje komfort zastávky. Sprcha má placenou službu a vyžaduje čistý ručník; použitý ručník skončí v koši na prádlo. Prádelnu v první verzi nesimulujeme: sklad dodává čisté ručníky a svoz odnáší použité. Spotřební náklad sprchy je součástí její účtenky.

Výchozí parametry: WC 7 sekund, pokles čistoty 18 bodů; sprcha 15 sekund, pokles 30 bodů; úklid kabiny 4 sekundy. Ruční úklid je dostupný vždy, později zaměstnanec přednostně čistí zavřenou kabinu a potom nejšpinavější. Nevyžaduje placené spotřební zásoby, takže nikdy nezablokuje restart provozu.

Komfort návštěvy se vyhodnotí jednou při odchodu: čekání, dostupnost plánovaných služeb a stav použitého zázemí. Ukazatel spokojenosti je průměr posledních 20 dokončených návštěv; červená bublina vysvětlí příčinu. Dobrá spokojenost zvyšuje šanci doplňkového nákupu u nových návštěv nejvýše o 20 procentních bodů. Základní palivová poptávka neklesne na nulu; nízké hodnocení nevytvoří spirálu bankrotu.

## 8. Personál a vylepšení

| Role | Od kdy | Skutečná činnost |
| --- | --- | --- |
| Pokladní | mini shop | odbavení nákupů a inkaso |
| Obsluha pump | zázemí personálu | chůze mezi kompatibilními stojany a zahajování tankování |
| Uklízeč | zázemí personálu | kabiny, koše, použité ručníky |
| Kuchař | teplé občerstvení | káva a hot dog |
| Skladník | logistika | přenášení krabic, kelímků a ručníků do cílových bufferů |
| Dispečer | logistika | objednávky zásob; postava pracuje u skladového pultu |

Pracovníci mají viditelný cíl, rezervaci úkolu a kapacitu. Dva pracovníci nesmí odebrat stejnou poslední krabici nebo inkasovat tutéž účtenku. Provozní mzdu zjednodušeně zahrnujeme do nastavených čistých výnosů; nevzniká mzdový dluh ani odchod zaměstnance při neaktivitě.

Šest hlavních upgrade řad po pěti úrovních: pohyb, nosnost, výkon pump, kapacita skladu, dovednost týmu a offline limit. Kvalita WC/sprch má vlastní tři úrovně. Vylepšení zobrazuje skutečný rozdíl, např. „8 s → 7 s“, a nekonečné nebo již maximální tlačítko není klikatelné. Všechny ceny jsou v datových definicích.

## 9. Ekonomika a ověřování tempa

Výchozí jednotkové hodnoty pro prototyp:

| Prodej | Hrubá tržba | Zahrnutý náklad | Čistý výnos |
| --- | --- | --- | --- |
| 1 jednotka paliva | 4 M | 1 M | 3 M |
| Voda / snack | 5 M | 2 M | 3 M |
| Káva | 7 M | 3 M | 4 M |
| Hot dog | 12 M | 5 M | 7 M |
| Cestovní / auto potřeby | 10 M | 4 M | 6 M |
| Řidičské potřeby / suvenýr | 14 M | 6 M | 8 M |
| Sprcha | 12 M | 3 M | 9 M |

Žádná procenta v této tabulce nevyjadřují reálné podnikatelské marže. Počet požadavků, časy dopravy a ceny vylepšení je nutné vyvážit společně. Přidání pumpy samo nesmí znásobit poptávku nad kapacitu mapy.

První auto má přijet do 3 sekund, první tržba do 25 sekund a první rozšíření přibližně do 60 sekund. Nová mechanika se má objevit nejpozději po 5 minutách aktivní hry. Čekání na peníze bez dosažitelného provozního úkolu nemá přesáhnout 90 sekund v prvních třech fázích.

Ověření: deterministický bot používá stejné cesty, kapacity a příkazy jako hráč. Změřit nejméně 20 seedů: časy rozšíření, příjem podle zdroje, obsazenost stojanů/parkování, čekání, ztracené návštěvy a čas hráče v ruční práci. Vyvážit i strategii s velkou investicí do vylepšení místo dalšího rozšíření. Výsledky doplnit pozorováním alespoň pěti lidí; simulační průchod nepotvrzuje zábavnost.

## 10. Offline provoz a návrat

Po nástupu personálu mohou offline vydělávat pouze služby s uzavřeným automatizovaným řetězcem. Bez dispečera a skladníka jsou limitovány aktuálními zásobami; bez uklízeče čistotou; bez pokladního žádný offline příjem ze shopu. Plná automatizace se odemkne až logistikou.

Doporučený výpočet: deterministicky postupovat ekonomiku v hrubých intervalech bez 3D entit a respektovat zásoby, průtok, zaměstnance i čistotu. Použít 65 % udržitelného čistého výkonu a limit dvě hodiny, upgrady maximálně osm hodin. Načtení nesmí simulovat jednotlivá auta za každý snímek. Cílové trvání výpočtu je pod 100 ms pro osmihodinový limit na referenčním zařízení; pokud je potřeba, použít analytický výpočet po službách se stejnými omezeními.

Offline zpracování odečte spotřebu a uloží nový čas i odměnu atomicky. Opakované načtení stejný interval nevyplatí podruhé. Zpětný posun hodin = nulový interval; velký skok dopředu = strop. Návrat ukáže jeden přehled „Tým vydělal…“, bez povinné reklamy a bez 2× tlačítka.

## 11. Grafika, zvuk a ovládání

Stylizované low-poly 3D dioráma ladící s restauracemi. Vlastní značka a modely. Paleta: krémová #FFF3D6, pumpová oranžová #ED7136, tlumená modrá #487B9B, šalvějová #8AAB86, asfaltová #44545E. Hlavním poznávacím prvkem je výrazná oblouková střecha s kruhovou ikonou zastávky; rozšíření proměňuje její siluetu.

Vlastní modely: tři osobáky, dvě varianty trucku, zásobovací cisterna a dodávka; pumpy, hadice, nádrže, značení, parkovací místa, regály, kávovar, hot dog pult, WC a sprchové kabiny, ručníky, koše, postavy šesti profesí. Interiér zázemí je symbolický, animace ukazuje dveře a stav obsazení.

Příjezd a odjezd, stáčení hadice, viditelný průběh nádrže, přenášení krabic, čistý povrch po úklidu, pára z kávy a sprchy. Při omezení efektů se potlačí částice a houpání kamery; význam akce zůstane viditelný. Vlastní krátké zvuky motoru, platby, čerpadla a dokončení; zvuk lze vypnout. Žádný převzatý asset konkurence.

Desktop: WASD/šipky a kliknutí na označení služby. Telefon: tažení prstem a klepnutí na cíl. Ruční vstup ruší naplánovanou cestu; ztráta fokusu a otevření menu zastaví pohyb. Kamera následuje hráče s tlačítkem přehledu celé stanice. Zakryté služby dostanou štítek u okraje; dotykové cíle alespoň 44 × 44 CSS px.

HUD: nahoře mince a fáze, pod nimi jediný aktuální úkol; důvod čekání přímo u služby. Podrobnosti o výnosech a stavu zásob jsou v panelu, nikoliv nad každým autem. Mobilní spodní navigace: Rozvoj, Tým, Služby, Nastavení. Dekorace nikdy nezakrývají aktivní zóny.

## 12. Jazyky a přístupnost

Stejných 20 jazyků jako u restaurací: en, cs, sk, de, fr, es, it, pt, pl, nl, uk, ru, ro, hu, tr, zh, ja, ko, ar, hi. Výchozí volba „Automaticky podle zařízení“ projde navigator.languages v pořadí, rozpozná regionální variantu a použije podporovaný jazyk; jinak angličtinu. V browseru jde o preference prohlížeče, které obvykle vycházejí z OS. Samostatná přímá detekce OS není potřeba.

Ruční volba se ukládá, automatickou lze znovu zapnout. Lokalizované jsou všechny cíle, služby, návody, chyby, nastavení i exportní hlášky. Čísla a časy formátuje Intl; měna zůstává fiktivní. Arabština používá RTL v UI, ale nezrcadlí svět, jízdní pruhy ani směry ovládání. Testovat delší němčinu, CJK i hindštinu na 360px šířce. Názvy jazyků se zobrazují vlastním písmem.

Barva není jediný indikátor: zásoby, špína i uzavření mají ikonu a text. Viditelný focus, klávesové ovládání menu, pauza, volba efektů a velikost čitelného textu patří do první verze.

## 13. Technický základ a oddělení projektů

Projekt bude v sourozeneckém adresáři GasStation s vlastní definicí obsahu, doménovou simulací, grafikou, ikonami, manifestem, uloženou hrou a samostatným dist. Stack odpovídá restauracím: TypeScript, Three.js, Vite, Vitest a Playwright. Společné závislosti a nástroje lze držet v RestaurantCommon.

Současný Common obsahuje restauracemi vázaný GameId, položky raw/prep/meal/trash, zákaznické stavy, čtyři role personálu i konkrétní mapu. **Benzinku nelze korektně přidat jen další barevnou definicí.**

| Oblast | Plán znovupoužití |
| --- | --- |
| Vstup, pauza, lifecycle, časový krok | Převzít ověřené části po oddělení od konkrétního GameState. |
| Lokalizace, obecná nastavení, dialogy | Sdílet mechanismus; přidat slovník benzinky, nepřepisovat restaurant texty. |
| Kamera, modelové primitivy, zvuk, omezení efektů | Sdílet malé pomocné moduly; nové modely a mapa patří benzince. |
| Uložení | Sdílet obal, export/import a časová pravidla; vlastní validované schéma gas v1. |
| Inventáře a fronty | Extrahovat jen opravdu společné atomické operace s testy; žádný univerzální ECS. |
| Vozidla a pěší trasy | Nový modul pruhů/rezervací; současná mřížka postav sama nestačí pro trucky. |
| Výroba, finance a hygienické služby | Vlastní gas simulace. Restaurant typy se nesmí rozšířit hromadou volitelných gas polí. |
| Build/PWA/test runner | Datově doplnit třetí target; zachovat samostatné cache, klíče a buildy. |

Navržené moduly v GasStation/src: definition, simulation, traffic, visitors, inventory, facilities, staff, economy, save, render a ui. Hranice určuje chování, ne povinná vrstva abstrakcí. Změny Common provádět až s konkrétním uživatelem ve třetí hře a regresními testy obou restaurací.

Uložení musí validovat nejen rozsahy čísel, ale vztahy: existující vozidlo/řidič, jediné rezervované místo, kompatibilní stojan, legitimní položky a průchozí pozice. Neznámou verzi nepřepsat. Při importu znovu vytvořit dynamické modely podle nového stavu.

## 14. Implementační etapy a akceptace

1. **Palivový průchod:** jedna pumpa, jedno auto, první platba, druhá pumpa. Test: vydané jednotky odpovídají úbytku zásoby a jedinému výnosu; bez peněz lze stále obnovit provoz.
2. **Doprava a pauza:** oddělené pruhy, parkování, řidič a shop. Test: 30minutový běh s plným parkovištěm nezablokuje výjezd; žádné dvojí rezervace; limity entit platí.
3. **Zázemí a občerstvení:** káva, hot dog, WC, zaměstnanci. Test: zavřená špinavá kabina nepřijme dalšího návštěvníka, úklid ji obnoví; nedostupná dobrovolná služba uvolní frontu.
4. **Trucky a sprchy:** diesel, delší rezervace pruhů, trucková stání, ručníky. Test: truck nikdy neobsadí krátké místo a stojan pro auta; řidič se vrátí ke správnému vozidlu.
5. **Dokončení a automatizace:** všech 12 rozšíření, upgrady, logistika, offline, závěr. Test: průchod 20 seedů; hodinový plně automatický provoz bez mrtvé fronty, záporných zásob nebo nekonečného růstu.
6. **Grafika, jazyky a distribuce:** vlastní finální modely, zvuky, PWA, 20 jazyků, RTL a produkční build. Test: dotykový průchod, klávesnice, export/import, offline spuštění a oba restaurant regresní balíky.

Další povinná kritéria:

- Refresh uprostřed tankování, sprchy, objednávky a částečného rozšíření zachová rozpracovanost bez dvojí platby.
- Neplatný import, nesprávná hra, budoucí verze a poškozené rezervace nezničí původní zálohu.
- Vyčerpání paliva, všech regálů i ručníků současně je obnovitelné ručně bez dalších peněz.
- Ztráta fokusu, dva dotyky, odpojení pointeru a návrat z pozadí nezanechají postavu v pohybu.
- První načtení běží online; po dokončení cache následuje plnohodnotný offline start. Service worker jiné hry se nedotkne jejích dat.
- Na mobilních 360 × 800 a 390 × 844 a desktopových 1366 × 768 nejsou zakryté důležité akce ani vodorovný posuv.
- Výkonový cíl: stabilních 30 FPS na zvoleném fyzickém středním Androidu, 60 FPS na běžném desktopu; měřit finální hustotu provozu a uvést přesný přístroj/browser. Emulace fyzický test nenahrazuje.
- Po deseti opakovaných importech se počet dynamických modelů vrací k počtu entit; žádné hromadění starých aut/pracovníků.
- Závěrečná dodávka obsahuje README, původ assetů, výsledky testů, screenshoty telefonu/desktopu a seznam skutečně neověřených zařízení.

## 15. Další obsah po ověření první lokace

Myčka se samostatným pruhem; servis pneumatik; dvě EV nabíječky s delším parkováním; malý motel; později jiná krajina nebo sezónní vzhled. Tyto nápady nyní nemají odemykací tlačítka, falešné termíny ani rozpracované platební obrazovky. Každý musí nejprve přinést smysluplné nové rozhodnutí a projít kontrolou kapacity mapy.

Podklad pro konkurenční srovnání a odkazy: [RESEARCH.md](RESEARCH.md).
