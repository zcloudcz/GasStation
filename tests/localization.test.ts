import {
  it,
  expect,
} from "../../RestaurantCommon/node_modules/vitest/dist/index.js";
import { dictionaries, text, locales, resolveLocale } from "../src/i18n";
it("all twenty languages cover the gas station content", () => {
  const keys = Object.keys(dictionaries.cs).sort();
  expect(locales.length).toBe(20);
  for (const locale of locales) {
    for (const key of keys)
      expect(text(key, locale.code).length).toBeGreaterThan(0);
    if (locale.code !== "en")
      expect(Object.keys(dictionaries[locale.code]).sort()).toEqual(keys);
  }
  expect(resolveLocale("auto", ["xx", "ar-EG"])).toBe("ar");
  expect(text("Free cash", "cs")).toBe("Volné peníze");
});
