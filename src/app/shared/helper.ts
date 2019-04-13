export function generatePassword(date, email) {
  let username = email.split("@")[0];
  const dob = new Date(date);
  return `${dob.getFullYear()}-${dob.getMonth() + 1}-${dob.getDate()}-${username}`;
}

export function convertToBoolProperty(val: any): boolean {
  if (typeof val === "string") {
    val = val.toLowerCase().trim();

    return val === "true" || val === "";
  }

  return !!val;
}

export function toBrowserTime(date=null) {
  let today = date?new Date(date):new Date();
  var tzo = -today.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function(num) {
      var norm = Math.floor(Math.abs(num));
      return (norm < 10 ? "0" : "") + norm;
    };
  return (
    today.getFullYear() +
    "-" +
    pad(today.getMonth() + 1) +
    "-" +
    pad(today.getDate()) +
    "T" +
    pad(today.getHours()) +
    ":" +
    pad(today.getMinutes()) +
    ":" +
    pad(today.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ":" +
    pad(tzo % 60)
  );
}