export function formatDateRange(date: any[]) {
  if (date) {
    let tempDate;
    if (date[1] !== null) {
      tempDate = formatDate(date[0]) + '/';
      tempDate += formatDate(date[1]);
    } else {
      tempDate = undefined;
    }
    return tempDate;
  }
}
export function formatDate(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return date.getFullYear() + '-' + month + '-' + day;
}
