// frontend/reactapp/src/utils/dateUtils.js
import { format, parseISO, isValid } from 'date-fns';
import { es, enUS } from 'date-fns/locale'; // Importa los locales que soportas

const locales = {
  es: es,
  en: enUS,
  // You can add more language-to-date-fns-locale mappings here
};

// Mapeo de las preferencias de formato del usuario a los strings de formato de date-fns
const userFormatToDateFnsFormat = {
  'dd/MM/yyyy': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
};

/**
 * Formats a date string (preferably ISO 8601) according to user preferences.
 * @param {string | Date} dateInput - La fecha a formatear (cadena ISO o objeto Date).
 * @param {string} userFormatPreference - La preferencia de formato del usuario (ej. 'DD/MM/YYYY').
 * @param {string} langPreference - La preferencia de idioma del usuario (ej. 'es', 'en').
 * @returns {string} The formatted date or 'N/A' if the input is invalid.
 */
export const formatDateByPreference = (dateInput, userFormatPreference, langPreference = 'es') => {
  if (!dateInput || !userFormatPreference) {
    return 'N/A';
  }

  const formatString = userFormatToDateFnsFormat[userFormatPreference] || userFormatPreference;
  const localeToUse = locales[langPreference] || locales.es; // Fallback to Spanish

  try {
    // Si dateInput ya es un objeto Date, no necesita parseISO.
    // If it is a string, parseISO is more robust for standard formats.
    const dateObject = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

    if (!isValid(dateObject)) {
        // console.warn(`Invalid date provided to formatDateByPreference: ${dateInput}`);
        // If the date is not ISO but might be a specific format, try to display it
        // or return N/A more strictly. For now, return the input.
        // Note that if it's already formatted and not ISO, parseISO will fail.
        return typeof dateInput === 'string' ? dateInput.split('T')[0] : 'Fecha Inv.'; 
    }

    return format(dateObject, formatString, { locale: localeToUse });
  } catch (error) {
    console.error("Error formateando fecha:", dateInput, userFormatPreference, error);
    return typeof dateInput === 'string' ? dateInput : 'Error de Fecha'; // Fallback en caso de error de formato
  }
};