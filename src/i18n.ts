import cs from "./locales/cs.json";
import sk from "./locales/sk.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import pl from "./locales/pl.json";
import nl from "./locales/nl.json";
import uk from "./locales/uk.json";
import ru from "./locales/ru.json";
import ro from "./locales/ro.json";
import hu from "./locales/hu.json";
import tr from "./locales/tr.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import {
  translate,
  resolveLocale,
  locales,
  type Locale,
} from "../../RestaurantCommon/src/ui/i18n";
export { locales, resolveLocale };
export type { Locale };
export const dictionaries: Record<string, Record<string, string>> = {
  cs,
  sk,
  de,
  fr,
  es,
  it,
  pt,
  pl,
  nl,
  uk,
  ru,
  ro,
  hu,
  tr,
  zh,
  ja,
  ko,
  ar,
  hi,
};
export function text(key: string, locale: Locale) {
  return dictionaries[locale]?.[key] ?? translate(key, locale);
}
