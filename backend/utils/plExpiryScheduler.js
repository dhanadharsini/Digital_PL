// backend/utils/plExpiryScheduler.js
// This scheduler automatically marks expired PLs

import PermissionLetter from '../models/PermissionLetter.js';
import EntryExitLog from '../models/EntryExitLog.js';

/**
 * Check and update expired permission letters
 * This function should be called periodically (e.g., every hour)
 */
export const checkAndUpdateExpiredPLs = async () => {
  try {
    const currentDateTime = new Date();

    // Find all approved PLs where arrival time has passed
    const expiredPLs = await PermissionLetter.find({
      status: 'approved',
      arrivalDateTime: { $lt: currentDateTime },
      isFullyUsed: { $ne: true } // Not already marked as fully used
    });

    let updatedCount = 0;
    let stillOnVacationCount = 0;

    for (const pl of expiredPLs) {
      // Check if student has logged entry
      const exitLog = await EntryExitLog.findOne({
        permissionLetterId: pl._id
      });

      if (exitLog && exitLog.entryTime) {
        // Student has returned - mark as fully used
        pl.status = 'expired';
        pl.isFullyUsed = true;
        pl.usedAt = exitLog.entryTime;
        await pl.save();
        updatedCount++;
      } else if (exitLog && exitLog.exitTime && !exitLog.entryTime) {
        // Student exited but hasn't returned - keep as approved but log warning
        stillOnVacationCount++;
      } else if (!exitLog) {
        // No exit log - student never used the PL, mark as expired
        pl.status = 'expired';
        pl.isFullyUsed = false; // Never used
        await pl.save();
        updatedCount++;
      }
    }

    return {
      success: true,
      checked: expiredPLs.length,
      updated: updatedCount,
      delayed: stillOnVacationCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Start the periodic scheduler
 * Call this function when your server starts
 */
export const startPLExpiryScheduler = () => {
  // Run immediately on startup
  checkAndUpdateExpiredPLs();

  // Then run every hour
  const intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds
  
  setInterval(() => {
    checkAndUpdateExpiredPLs();
  }, intervalMs);
};