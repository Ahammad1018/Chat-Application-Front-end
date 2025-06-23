const getFormattedDateTime = (format : string) => {
    const now = new Date();
  
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
  
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
  
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, "0");
    
    if (format == "seconds"){
        return seconds;
    } else if (format == "date") {
        return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    }

    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

export {getFormattedDateTime};