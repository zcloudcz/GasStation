# Ověření GasStation

30. září 2026. Místní Windows, Node.js a instalovaný Chrome.

## Automatické kontroly

- npm test: **16 testů ve 4 souborech, vše prošlo**, včetně následného odmítnutí importu fyzicky překrytých vozidel.
- Společný npm run typecheck: prošel včetně GasStation.
- npm run build: prošel, přibližně 782 kB JS / 215 kB gzip a 12 kB CSS / 3,6 kB gzip. Vite upozorňuje na větší JS chunk; není to chyba sestavení.
- Dvacet seedů bez přidání peněz: **46,86–48,20 minuty** k dokončení. Kontrolována nekolidující doprava a platné uložení.
- Hodinová plná automatizace: omezené entity, nezáporné zásoby a čitelná záloha.

Regrese: celočíselné a konzistentní reference, rezervace služeb/parkování, jednorázové platby, úklid na 100 %, znovuotevření kabin, automobilová a trucková doprava, časovaná příprava jídla, šest kategorií shopu a offline omezení zavřeného provozu. Lokalizační test porovnává úplnost všech vlastních slovníků.

## Browser a vizuální kontrola

Společné scénáře v RestaurantCommon/tests/browser/gas.spec.ts: první ruční tankování/odemčení/reload; mobil a arabské RTL; klávesnice/ztráta fokusu; import rozvinuté stanice a produkční offline start; ochrana nečitelné zálohy; menu ruší pohyb; doplnění vyčerpaného dieselu; dosažitelnost samostatných mobilních štítků.

První čtyři scénáře a tři následné regrese prošly během integrace. Finální společný běh eviduje také RestaurantCommon/docs/VALIDATION.md.

Vizuálně zkontrolovány rozměry 1440 × 1000 a 390 × 844, začátek i rozvinutý provoz. Štítky v portrétu mají kolizní rozestupy a 44px dotykové cíle; služby mají také tlačítka v panelu.

## Omezení

Fyzický Android/iPhone nebyl testován; emulace neověřuje skutečnou spotřebu, FPS ani instalaci na zařízení. Nebylo provedeno pozorování pěti lidských hráčů nebo měření retence. Překlady nebyly nezávisle ověřené rodilými mluvčími.

Offline příjem používá omezený ekonomický simulační interval a konzervativní škálování až pro otevřený plně automatizovaný provoz, nikoliv přehrání každého offline auta. Hra nebyla zveřejněna v obchodech ani na veřejném hostingu.


## Vizuální zpřehlednění
Kontrastní asfalt a pěší pás, barevně rozlišené služby a jejich popisky, číslované pumpy, spojnice k objektům a bílý kruh hráče. Plná střecha nahrazena otevřenou konstrukcí. V mobilním detailu se popisky objektů mimo záběr skrývají; zůstávají dostupné v přehledu a panelu služeb. Ověření: typecheck, produkční build a desktopové/mobilní screenshoty.
Finální běh po úpravě mobilních popisků: všech 7 browserových scénářů prošlo (35,1 s), včetně skrytí služby mimo záběr a její dostupnosti v přehledu.

## Detailnější modely areálu
Kiosky mají vlastní vybavení (regály, lednici, espresso a gril), WC a sprchy otevřené interiéry. Auta mají boční skla, zrcátka, nárazníky a detailnější kola; areál dlažbu, přechod a sloupky. Souřadnice herních interakcí se nemění. Screenshoty visual-upgrade-desktop.png a visual-upgrade-mobile.png zachycují rozvinutý provoz při 1440×1000 a 390×844. Chrome render bez chyb, produkční build a společný typecheck prošly.

Finální kontrola grafiky: nízké středy stěn a boční regály zachovávají výhled na hráče u všech služeb; popisky rezervují místo kolem jeho postavy. Vizuálně ověřena skutečná obsluha shopu, kávy, WC a sprchy na desktopu i mobilu (interacting-* screenshoty). Nezávislé review bez zbývajících nálezů, všech 7 browserových scénářů prošlo za 35 s.

## Viditelná kapacita nádrží
U každého stojanu je aktuální zásoba / celková kapacita společné nádrže, ukazatel naplnění a samostatný průběh tankování auta. Trvalý HUD uvádí benzín i odemčený diesel. Texty jsou ve všech 20 jazycích. Ověřena změna kapacity po upgradu, vyčerpání, mobilní rozložení a nezávislá klikatelnost stojanů. Samostatný běh: 16 jednotkových a 9 browserových testů prošlo.


Paid supplies final verification (2026-09-30): 22 unit tests and all 12 Gas browser scenarios pass; quote/charge once/reload, emergency credit disclosure, actual stock costs, fixed cargo, legacy delivery migration and hidden-tab offline timestamp covered. Build and shared typecheck pass.


## UI rodiny RestaurantCommon — 2026-10-01

Horní lišta je nyní mimo herní plochu; žlutá peněženka a SVG ikony využívají společný vizuální jazyk. Pravý panel má průběh rozšíření, investiční kartu, sbalitelné milníky a rychlé odkazy; na mobilu spodní navigaci a výsuvný panel. Ovládání respektuje skutečné obdélníky HUD při umísťování popisků.

Ověření: 12 původních Gas browser scénářů a 4 nové UI scénáře prošly; desktop 1440×1000, mobil 390×844, arabské RTL a landscape 844×390. Kontrola typů a produkční build prošly. Nezávisle prohlédnuty screenshoty desktopu, mobilu, výsuvného panelu a landscape. Ekonomika ani simulace se neměnily. Fyzický telefon nebyl ověřen.

Snímky: `screenshots/ui-family-desktop-cs.png`, `screenshots/ui-family-mobile-cs.png`.


### Kolize chodců (1. 10. 2026)

Hráč, zaměstnanci a návštěvníci používají sdílené hledání cesty kolem budov, pump, skladu, sloupů a zaparkovaných vozidel. Pohybující se auto zablokuje další krok; dopravní rezervace a vzájemné kolize vozidel zůstávají oddělené. Starší pozice uvnitř překážky se při načtení přesunou na nejbližší volné místo, inventář zůstává zachován.

Samostatné regresní testy ověřují dosažitelnost všech obslužných bodů, ruční pohyb proti budově, obcházení zaparkovaného auta, migraci pozic a 1 500 živých kroků, v nichž všechny postavy zůstávají mimo překážky. Výkonnostní měření hodiny simulace (36 000 kroků) trvalo v samostatném běhu přibližně 16,6 s, tedy 0,46 ms na krok; souběžný běh s dvaceti postupovými simulacemi dosáhl 31,4 s. Nejde o měření snímkové frekvence v prohlížeči. Dlouhé simulační testy mají samostatný časový rozpočet; limity herního postupu 35–50 minut, zásob a nepřekrývání vozidel zůstaly stejné.

### Závěrečné ověření vzhledu a kolizí — 1. 10. 2026

Bližší kamera s přepnutím na přehled, pískové prostředí, výraznější pumpy a auta; půdorysy služeb zůstávají stejné. Snímky redesign-desktop.png, redesign-mobile.png a redesign-navigation-mobile.png zachycují výsledný vzhled. Nový mobilní browserový scénář ověřil cestu ke službě a pumpě, ruční pohyb mimo překážky a rozložení bez přetečení.

Finální GasStation běh: 7 souborů, 51/51 testů, exit 0, 406,62 s. Dvacet samostatně hlášených průchodů dosáhlo všech rozšíření za 47,54–49,78 herní minuty; kontroly peněz, zásob, uložení a nepřekrývání vozidel zůstaly zachovány. Dlouhý test pravidelně předává řízení event loopu, aby neblokoval komunikaci Vitest workeru. Společná kontrola typů a produkční buildy GasStation i RestaurantWorld prošly. Fyzický telefon nebyl testován.
