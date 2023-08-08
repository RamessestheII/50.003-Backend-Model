function convertMongoDate(date){
    const jsDate = new Date(date);

    // Get year, month, and day from JavaScript Date object
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');

    // Create yyyy-mm-dd formatted string
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate
}

exports.convertMongoDate = convertMongoDate