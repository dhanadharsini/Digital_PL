// backend/utils/plExpiryScheduler.js
// This scheduler automatically marks expired PLs and notifies parents of delays

import PermissionLetter from '../models/PermissionLetter.js';
import EntryExitLog from '../models/EntryExitLog.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Outpass from '../models/Outpass.js';
import { sendEmail } from '../config/email.js';
import { studentOverdueParentEmail, outpassOverdueParentEmail } from './emailTemplates.js';

/**
 * Check and update expired permission letters and notify parents of overdue returns
 */
export const checkAndUpdateExpiredPLs = async () => {
  try {
    const currentDateTime = new Date();
    console.log(`\n--- PL/Outpass Expiry Scheduler: Running at ${currentDateTime.toLocaleString()} ---`);

    // ============================================
    // 1. Process Overdue Outpasses 
    // ============================================
    const overdueOutpasses = await Outpass.find({
      status: 'active',
      exitTime: { $ne: null },
      actualReturnTime: null,
      expectedReturnTime: { $lt: currentDateTime },
      isOverdueNotificationSent: { $ne: true }
    });

    console.log(`[Scheduler] Searching for active outpasses where expectedReturnTime < ${currentDateTime.toLocaleString()}`);
    console.log(`[Scheduler] Found ${overdueOutpasses.length} potentially overdue Outpasses for notification check`);

    for (const outpass of overdueOutpasses) {
      try {
        const student = await Student.findById(outpass.studentId);
        const parent = await Parent.findOne({ studentRegNo: outpass.regNo });

        if (student && parent && parent.email) {
          console.log(`Sending outpass overdue notification for ${student.name} to parent ${parent.email}`);

          const emailHtml = outpassOverdueParentEmail(student.name, parent.name, {
            expectedReturnTime: outpass.expectedReturnTime,
            exitTime: outpass.exitTime,
            placeOfVisit: outpass.placeOfVisit
          });

          await sendEmail(
            parent.email,
            `🚨 URGENT: Student Outpass Overdue Notification - ${student.name}`,
            emailHtml
          );

          outpass.isOverdueNotificationSent = true;
          await outpass.save();
          console.log(`✓ Outpass overdue notification sent successfully`);
        }
      } catch (innerError) {
        console.error(`Error sending outpass overdue notification for Outpass ${outpass._id}:`, innerError.message);
      }
    }

    // ============================================
    // 2. Process Overdue Vacation Returns (PLs)
    // ============================================
    // Find PLs where:
    // - status is 'approved'
    // - arrival time has passed
    // - isFullyUsed is not true
    // - overdue notification hasn't been sent yet
    const overduePLs = await PermissionLetter.find({
      status: 'approved',
      arrivalDateTime: { $lt: currentDateTime },
      isFullyUsed: { $ne: true },
      isOverdueNotificationSent: { $ne: true }
    });

    console.log(`[Scheduler] Searching for approved PLs where arrivalDateTime < ${currentDateTime.toLocaleString()}`);
    console.log(`[Scheduler] Found ${overduePLs.length} potentially overdue PLs for notification check`);

    for (const pl of overduePLs) {
      // Check if student has actually exited (we only notify if they are "out")
      const exitLog = await EntryExitLog.findOne({
        permissionLetterId: pl._id,
        exitTime: { $ne: null },
        entryTime: null
      });

      if (exitLog) {
        // student is "OUT" and overdue - send notification
        try {
          const student = await Student.findById(pl.studentId);
          const parent = await Parent.findOne({ studentRegNo: pl.regNo });

          if (student && parent && parent.email) {
            console.log(`Sending overdue notification for ${student.name} to parent ${parent.email}`);

            const emailHtml = studentOverdueParentEmail(student.name, parent.name, {
              expectedReturnTime: pl.arrivalDateTime,
              exitTime: exitLog.exitTime,
              placeOfVisit: pl.placeOfVisit
            });

            await sendEmail(
              parent.email,
              `🚨 URGENT: Student Overdue Notification - ${student.name}`,
              emailHtml
            );

            // Mark as sent so we don't spam
            pl.isOverdueNotificationSent = true;
            await pl.save();
            console.log(`✓ Overdue notification sent successfully`);
          }
        } catch (innerError) {
          console.error(`Error sending overdue notification for PL ${pl._id}:`, innerError.message);
        }
      }
    }

    // 2. Original Expiry Logic (Marking as expired if never used or used)
    const allExpiredCandidates = await PermissionLetter.find({
      status: 'approved',
      arrivalDateTime: { $lt: currentDateTime },
      isFullyUsed: { $ne: true }
    });

    let updatedCount = 0;
    let stillOnVacationCount = 0;

    for (const pl of allExpiredCandidates) {
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
        // Student exited but hasn't returned - stays as 'approved' but we've handled notification above
        stillOnVacationCount++;
      } else if (!exitLog) {
        // No exit log - student never used the PL, mark as expired
        pl.status = 'expired';
        pl.isFullyUsed = false;
        await pl.save();
        updatedCount++;
      }
    }

    console.log(`Scheduler Result: ${updatedCount} PLs updated, ${stillOnVacationCount} PLs still out, ${overdueOutpasses.length} Outpasses notified`);
    return {
      success: true,
      plChecked: overduePLs.length,
      outpassChecked: overdueOutpasses.length,
      plUpdated: updatedCount,
      plDelayed: stillOnVacationCount
    };
  } catch (error) {
    console.error('Scheduler Error:', error.message);
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
  console.log('--- Initializing PL/Outpass Expiry Scheduler ---');
  checkAndUpdateExpiredPLs();

  // Then run every minute (60,000 ms) instead of every hour
  // This ensures parents get warning emails closer to the actual expiry time
  const intervalMs = 60 * 1000; 

  setInterval(() => {
    checkAndUpdateExpiredPLs();
  }, intervalMs);
  
  console.log(`--- Scheduler started: running checks every ${intervalMs/1000} seconds ---`);
};