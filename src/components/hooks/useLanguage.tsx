import { useUserContext } from "../context/UserContext";
import de from "../Json/Languages/de.json";
import en from "../Json/Languages/en.json";
import es from "../Json/Languages/es.json";
import fr from "../Json/Languages/fr.json";
import he from "../Json/Languages/he.json";
import it from "../Json/Languages/it.json";
import pt from "../Json/Languages/pt.json";
import ru from "../Json/Languages/ru.json";
import zh from "../Json/Languages/zh.json";
// import { useUserContext } from "../context/UserContext/UserContext";
// import { getLocales } from "expo-localization";

type Translations = typeof en & typeof es;

const resources: Record<string, Translations> = {
  de,
  en,
  es,
  fr,
  he,
  it,
  pt,
  ru,
  zh,
};

const useLanguage = () => {
  const deviceLanguage = navigator.language.split("-")[0];
  const { language } = useUserContext();
  const supportedLanguages = [
    "de",
    "en",
    "es",
    "fr",
    "he",
    "it",
    "pt",
    "ru",
    "zh",
  ];

  const languageCode = language
    ? language
    : supportedLanguages.includes(deviceLanguage)
    ? deviceLanguage
    : "en";

  const getLabel = (
    label: keyof Translations,
    params?: Record<string, string>
  ): string => {
    let result =
      resources[languageCode!]?.[label] || resources.en[label] || label;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`{{param}}`, value);
      });
    }

    return result;
  };

  return { languageCode, getLabel };
};

export default useLanguage;
