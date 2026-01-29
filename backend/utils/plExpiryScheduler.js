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
    
    console.log(`[PL Expiry Check] Running at ${currentDateTime.toISOString()}`);

    // Find all approved PLs where arrival time has passed
    const expiredPLs = await PermissionLetter.find({
      status: 'approved',
      arrivalDateTime: { $lt: currentDateTime },
      isFullyUsed: { $ne: true } // Not already marked as fully used
    });

    console.log(`[PL Expiry Check] Found ${expiredPLs.length} expired PLs`);

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
        console.log(`[PL Expiry] Marked PL ${pl._id} as expired (student returned)`);
      } else if (exitLog && exitLog.exitTime && !exitLog.entryTime) {
        // Student exited but hasn't returned - keep as approved but log warning
        stillOnVacationCount++;
        console.warn(`[PL Expiry WARNING] Student ${pl.name} (${pl.regNo}) is delayed. PL expired but student still on vacation.`);
      } else if (!exitLog) {
        // No exit log - student never used the PL, mark as expired
        pl.status = 'expired';
        pl.isFullyUsed = false; // Never used
        await pl.save();
        updatedCount++;
        console.log(`[PL Expiry] Marked unused PL ${pl._id} as expired`);
      }
    }

    console.log(`[PL Expiry Check] Complete. Updated: ${updatedCount}, Still on vacation (delayed): ${stillOnVacationCount}`);

    return {
      success: true,
      checked: expiredPLs.length,
      updated: updatedCount,
      delayed: stillOnVacationCount
    };
  } catch (error) {
    console.error('[PL Expiry Check] Error:', error);
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

  console.log('[PL Expiry Scheduler] Started. Will check every hour.');
};