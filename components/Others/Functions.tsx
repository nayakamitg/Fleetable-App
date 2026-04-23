export function convertToStandardDate(dateStr: string) {
    if (!dateStr || typeof dateStr !== 'string') {
        return null;
    }

    dateStr = dateStr.trim();
    let date = null;

    // Try to parse as a standard date first
    const parsedDate = new Date(dateStr);
    
    // Check if it's a valid date
    if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
    } else {
        // Try manual parsing for formats like dd/mm/yyyy or mm/dd/yyyy
        const parts = dateStr.split(/[\/\-\.]/);
        
        if (parts.length === 3) {
            let day, month, year;
            
            // Determine year position (usually the longest number or >31)
            if (parts[2].length === 4 || parseInt(parts[2]) > 31) {
                year = parseInt(parts[2]);
                // If year is 2 digits, convert to 4 digits
                if (year < 100) {
                    year += year > 30 ? 1900 : 2000;
                }
                
                // Try to determine if it's dd/mm or mm/dd
                const first = parseInt(parts[0]);
                const second = parseInt(parts[1]);
                
                if (first > 12) {
                    // Must be dd/mm/yyyy
                    day = first;
                    month = second;
                } else if (second > 12) {
                    // Must be mm/dd/yyyy
                    month = first;
                    day = second;
                } else {
                    // Ambiguous - default to dd/mm/yyyy (European format)
                    // You can change this to mm/dd/yyyy if you prefer US format
                    day = first;
                    month = second;
                }
            } else if (parts[0].length === 4 || parseInt(parts[0]) > 31) {
                // yyyy/mm/dd format
                year = parseInt(parts[0]);
                month = parseInt(parts[1]);
                day = parseInt(parts[2]);
            }
            
            if (year && month && day) {
                date = new Date(year, month - 1, day);
            }
        }
    }

    // If we still don't have a valid date, return null
    if (!date || isNaN(date.getTime())) {
        return null;
    }

    // Format to dd/mm/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}



export function isValidDDMMYYYY(dateStr:string) {
  // Check format using regex
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  
  if (!regex.test(dateStr)) return false;

  // Split values
  const [day, month, year] = dateStr.split('/').map(Number);

  // Create date object
  const date = new Date(year, month - 1, day);

  // Validate actual date (handles 30 Feb, leap year etc.)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}