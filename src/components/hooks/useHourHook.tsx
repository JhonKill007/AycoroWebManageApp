import useLanguage from "./useLanguage";

interface ITime {
  days: number;
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
  ticks: number;
  totalDays: number;
  totalHours: number;
  totalMilliseconds: number;
  totalMinutes: number;
  totalSeconds: number;
}

const useHourHook = () => {
  const { getLabel } = useLanguage();
  const gethour = (date: Date): string => {
    return date.toLocaleTimeString("es-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getElapsedTime = (value: Date): string => {
    const date = new Date(value);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffWeeks / 4);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffSeconds < 1) {
      return getLabel("ahora");
    } else if (diffSeconds < 60) {
      return diffSeconds !== 1
        ? getLabel("segundos", { param: `${diffSeconds}` })
        : getLabel("segundo", { param: `${diffSeconds}` });
    } else if (diffMinutes < 60) {
      return diffMinutes !== 1
        ? getLabel("minutos", { param: `${diffMinutes}` })
        : getLabel("minuto", { param: `${diffMinutes}` });
    } else if (diffHours < 24) {
      return diffHours !== 1
        ? getLabel("horas", { param: `${diffHours}` })
        : getLabel("hora", { param: `${diffHours}` });
    } else if (diffDays < 30) {
      return diffDays !== 1
        ? getLabel("dias", { param: `${diffDays}` })
        : getLabel("dia", { param: `${diffDays}` });
    } else if (diffWeeks < 4) {
      return diffWeeks !== 1
        ? getLabel("semanas", { param: `${diffWeeks}` })
        : getLabel("semana", { param: `${diffWeeks}` });
    } else if (diffMonths < 12) {
      return diffMonths !== 1
        ? getLabel("meses", { param: `${diffMonths}` })
        : getLabel("mes", { param: `${diffMonths}` });
    } else {
      return diffYears !== 1
        ? getLabel("anos", { param: `${diffYears}` })
        : getLabel("ano", { param: `${diffYears}` });
    }
  };

  const formatDuration = (duration: number | null): string => {
    if (!duration) return "00:00";
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTime = (time: ITime) => {
    const h = String(time.hours).padStart(2, "0");
    const m = String(time.minutes).padStart(2, "0");
    const s = String(time.seconds).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return {
    gethour,
    getElapsedTime,
    formatDuration,
    formatTime,
  };
};

export default useHourHook;
