export const getDateTimeOneWeekFromToday: () => Date = () => {
    let today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, today.getHours() - today.getTimezoneOffset() / 60, today.getMinutes());
}

export const getIsoDateString: (Date) => string = (date) => date.toISOString().substring(0, 16)
export const convertLocalDateTimeStringToDate: (string) => Date = (dateString) => new Date(dateString + 'Z')

export const convertUTCDateToLocalDate: (Date) => Date = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - date.getTimezoneOffset() / 60, date.getMinutes());
}