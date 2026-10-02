# Next Stop — Gas Station

Tycoon hra o čerpací stanici: z jedné pumpy postav stanici pro auta i trucky se shopem, kávou, WC a sprchami a najmi personál.

Offline 3D hra pro prohlížeč a mobil (PWA), 20 jazyků, bez reklam a nákupů. Závisí na: RestaurantCommon.

## Spuštění

```bash
npm run dev      # http://localhost:4175
npm run build    # výstup v dist/
npm run preview
npm test         # unit testy
```

Podrobný popis hry: [docs/DETAILS.md](docs/DETAILS.md)

## Rodina repozitářů

Hry sdílí kód přes relativní cesty, proto se všechny repozitáře klonují **vedle sebe do jedné složky** (názvy složek musí zůstat stejné):

```bash
for r in RestaurantCommon CommonAdvanced BurgerRush PizzaPiazza GasStation RestaurantWorld; do git clone https://github.com/zcloudcz/$r.git; done
cd RestaurantCommon && npm ci
```

| Repo | Obsah |
|---|---|
| [RestaurantCommon](https://github.com/zcloudcz/RestaurantCommon) | sdílený engine, UI, build a testy |
| [CommonAdvanced](https://github.com/zcloudcz/CommonAdvanced) | provozní simulace pro RestaurantWorld |
| [BurgerRush](https://github.com/zcloudcz/BurgerRush) · [PizzaPiazza](https://github.com/zcloudcz/PizzaPiazza) · [GasStation](https://github.com/zcloudcz/GasStation) · [RestaurantWorld](https://github.com/zcloudcz/RestaurantWorld) | hry |

Stack: TypeScript, Three.js, Vite, Vitest, Playwright. Node.js 22.12+, prohlížeč s WebGL 2.
