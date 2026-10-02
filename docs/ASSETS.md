# Grafika a sdílené části

Modely benzinky vznikají v src/scene.ts z původních geometrických tvarů. Nejsou stažené z konkurenčních her ani asset storů. Malé pomocné funkce box/cylinder/ball/material/sign/bakeScenery sdílíme z RestaurantCommon.

Vlastní modely: auta, trucky, zásobovací vozidlo, pumpy s hadicí, střecha, parkování, sklad s krabicemi, regály, kávovar, hot dog pult, WC/sprchy, pracovníci a návštěvníci. Animace a nesené zásoby vycházejí ze skutečného stavu. Kvalita zázemí přidává vizuální detaily.

public/icon.svg je původní vektorový návrh. PNG 192/512 vznikají z tohoto SVG společným scripts/icons.mjs. UI používá systémové fonty a Unicode; emoji se mohou lišit podle OS. Krátké zvuky syntetizuje WebAudio helper Common.

Externí runtime závislost: Three.js. Build/test nástroje poskytuje Common (Vite, TypeScript, Vitest, Playwright); licenční texty balíků jsou v jejich instalaci a verze eviduje package-lock Common.

Screenshoty jsou skutečné headless Chrome rendery. *-complete zobrazují importovaný testovací stav rozšířené stanice, nikoli doklad ručního průchodu. Reprodukovatelný generátor scripts/capture.mjs používá dev server 4175.

