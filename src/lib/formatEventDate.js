/****
 * Formata uma string de data ISO para o formato brasileiro
 * @param {string} isoString - A string de data no formato ISO
 * @param {('full'|'short'|'time')} [format='full'] - O tipo de formato a ser usado
 * @returns {string} A data formatada em português do Brasil
 */
export const formatEventDate = (isoString, format = 'full') => {
    const date = new Date(isoString);

    const formats = {
        full: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Sao_Paulo'
        },
        short: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'America/Sao_Paulo'
        },
        time: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Sao_Paulo'
        }
    };

    if (format === 'time') {
        return date.toLocaleTimeString('pt-BR', formats[format]);
    }

    return date.toLocaleDateString('pt-BR', formats[format]);
};