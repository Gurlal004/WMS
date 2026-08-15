// src/utils/dateUtils.ts

export const formatSafeDate = (dateVal: any): string => {
    if (!dateVal) return "-";

    // Case 1: Real Firestore Timestamp (Live Data created today)
    if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        return dateVal.toDate().toLocaleString();
    }

    // Case 2: Standard JSON Import (seconds without underscore)
    if (dateVal.seconds != null) { 
        return new Date(Number(dateVal.seconds) * 1000).toLocaleString();
    }

    // ✅ CASE 3: THIS IS FOR YOUR SCREENSHOT (Fields with "_seconds")
    if (dateVal._seconds != null) {
        return new Date(Number(dateVal._seconds) * 1000).toLocaleString();
    }

    // Case 4: Strings or standard Dates
    try {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString();
    } catch (e) {
        return "Error";
    }
};