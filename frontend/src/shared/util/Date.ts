export const stringToTimeStamp = (date: string | null | undefined) => {
  if (date == null || date == "" || date == undefined) {
    return null;
  }
  console.log("HELKKEJLKJSF", new Date(date).toISOString());
  return new Date(date).toISOString();
};

export const stringToUSDate = (date: string | null | undefined) => {
  // Convert to Date object
  if (date == null || date == "" || date == undefined) {
    return null;
  }
  const dateObj = new Date(date);

  // Extract month, day, and year
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const year = dateObj.getUTCFullYear();

  // Format as mm/dd/yyyy
  return `${month}/${day}/${year}`;
};

export const stringToHTMLDate = (date: string | null) => {
  // Convert to Date object
  if (date == null || date == "") {
    return "";
  }
  const dateObj = new Date(date);

  // Extract month, day, and year
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const year = dateObj.getUTCFullYear();
  console.log(`${year}/${month}/${day}`);
  // Format as yyyy/mm/dd
  return `${year}-${month}-${day}`;
};

export const stringToJSDate = (date: string) => {
  return new Date(date);
};
