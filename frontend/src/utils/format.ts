
export const formatVND = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return "0 ₫";
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatCompactVND = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return "0";
  }
  return new Intl.NumberFormat('vi-VN', { 
    notation: "compact", 
    compactDisplay: "short", 
    maximumFractionDigits: 1 
  } as Intl.NumberFormatOptions).format(value);
};

export const formatDateVN = (date: string | Date | undefined | null): string => {
  if (!date) {
    return "N/A";
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return "N/A";
  }
  return dateObj.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const formatDateTimeVN = (date: string | Date | undefined | null): string => {
  if (!date) {
    return "N/A";
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return "N/A";
  }
  return dateObj.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatNumberVN = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return "0";
  }
  return value.toLocaleString("vi-VN");
};
