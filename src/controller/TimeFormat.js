function leftPad(val, min_width, pad=" ") {
   /** @type {string} */
   const str_val = val.toString();
   const pad_width = min_width - str_val.length;
   return (pad_width > 0) ? Array(pad_width).fill(pad) + str_val : str_val;
}

/**
 * @param {Date} date 
 * @returns {string}
 */
export function ISODateFormat(date) {
   let month = leftPad(date.getMonth()+1, 2, "0");
   let day   = leftPad(date.getDate(), 2, "0");
   let year  = leftPad(date.getFullYear(), 4, "0");
   const ret_val = [year, month, day].join('-');
   console.log(`With toISOString: ${date.toISOString().split('T')[0]}, with our approach: ${ret_val}`)
   return ret_val
}

/**
 * 
 * @param {Date} date 
 * @returns {string}
 */
export function USDateFormat(date, sep='/') {
   let month = leftPad(date.getMonth()+1, 2, "0");
   let day   = leftPad(date.getDate(), 2, "0");
   let year  = leftPad(date.getFullYear(), 4, "0");
   return [month, day, year].join(sep);
}