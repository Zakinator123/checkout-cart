export const getDateTimeOneWeekFromToday: () => Date = () => {
    let today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, today.getHours() - today.getTimezoneOffset() / 60, today.getMinutes());
}

export const getIsoDateString: (Date) => string = (date) => {
    return date.toISOString().substring(0, 16);
}

export const convertLocalDateTimeStringToDate: (string) => Date = (dateString) => {
    return new Date(dateString + 'Z');
}