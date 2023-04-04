export const getDateTimeVariableNumberOfDaysFromToday: (numDaysFromToday: number) => Date = (numDaysFromToday) => {
    let today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + numDaysFromToday, today.getHours() - today.getTimezoneOffset() / 60, today.getMinutes());
}

export const getIsoDateString: (date: Date) => string = (date) => date.toISOString().substring(0, 10)
export const convertLocalDateTimeStringToDate: (dateString: string) => Date = (dateString) => new Date(dateString + 'Z')
export const convertUTCDateToLocalDate: (date: Date) => Date = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - date.getTimezoneOffset() / 60, date.getMinutes());
}