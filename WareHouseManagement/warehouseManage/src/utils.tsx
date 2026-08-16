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

// export const isOutsideWorkingHoursInPoland = (): boolean => {
//     const now = new Date();
    
//     // Fetch current time strictly in Warsaw, ignoring the user's local PC time
//     const formatter = new Intl.DateTimeFormat('en-US', {
//         timeZone: 'Europe/Warsaw',
//         hour: 'numeric',
//         minute: 'numeric',
//         hour12: false // Force 24-hour clock
//     });
    
//     const parts = formatter.formatToParts(now);
    
//     // Some browsers format midnight as 24 in Intl, so we standardize it to 0
//     let hour = parseInt(parts.find(p => p.type === 'hour')?.value || "0", 10);
//     if (hour === 24) hour = 0; 
    
//     const min = parseInt(parts.find(p => p.type === 'minute')?.value || "0", 10);

//     // const hour: number = 18; // 6:00 PM (Past the 5:20 PM cutoff)
//     // const min: number = 0;

//     // Closed Condition 1: After 17:20 (5:20 PM)
//     const isAfterClose = hour > 17 || (hour === 17 && min >= 20);
    
//     // Closed Condition 2: Before 07:00 (7:00 AM)
//     const isBeforeOpen = hour < 7;

//     return isAfterClose || isBeforeOpen;
// };

export const isOutsideWorkingHoursInPoland = (role: string): boolean => {
    // Admins are never locked out by the clock
    if (role === "admin") return false;

    const now = new Date();
    
    // Fetch current time strictly in Warsaw
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Warsaw',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false // Force 24-hour clock
    });
    
    const parts = formatter.formatToParts(now);
    let hour = parseInt(parts.find(p => p.type === 'hour')?.value || "0", 10);
    if (hour === 24) hour = 0; 
    
    const min = parseInt(parts.find(p => p.type === 'minute')?.value || "0", 10);

    // Everyone (except admin) is locked out before 7:00 AM
    const isBeforeOpen = hour < 7;

    // Evaluate cutoff based on role
    if (role === "s_user") {
        // Super Users work overtime: Cutoff at 22:00 (10:00 PM)
        const isAfterClose = hour >= 22; 
        return isBeforeOpen || isAfterClose;
    } else {
        // Standard Users: Cutoff at 17:20 (5:20 PM)
        const isAfterClose = hour > 17 || (hour === 17 && min >= 20);
        return isBeforeOpen || isAfterClose;
    }
};