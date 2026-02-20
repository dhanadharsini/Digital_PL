export const plRequestToParentEmail = (studentName, plDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #667eea; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #667eea; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .approve { background-color: #28a745; color: white; }
        .reject { background-color: #dc3545; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Permission Letter Request</h2>
        </div>
        <div class="content">
          <p>Dear Parent,</p>
          <p>Your child <strong>${studentName}</strong> has submitted a permission letter request.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Reason:</strong> ${plDetails.reasonOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${new Date(plDetails.arrivalDateTime).toLocaleString()}</p>
          </div>
          
          <p>Please login to your parent portal to approve or reject this request.</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/parent/pl-requests" class="button approve">Go to Portal</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plApprovedByParentEmail = (studentName, plDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Permission Approved by Parent</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your permission letter request has been <strong>approved by your parent</strong>.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${new Date(plDetails.arrivalDateTime).toLocaleString()}</p>
          </div>
          
          <p>Your request is now pending warden approval. You will be notified once the warden reviews your request.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plRejectedByParentEmail = (studentName, plDetails, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #dc3545; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✗ Permission Rejected by Parent</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your permission letter request has been <strong>rejected by your parent</strong>.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Reason for Rejection:</strong> ${reason}</p>
          </div>
          
          <p>Please contact your parent for more information.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plApprovedByWardenEmail = (studentName, plDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #28a745; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #667eea; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Permission Letter Approved!</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your permission letter request has been <strong>fully approved</strong>!</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${new Date(plDetails.arrivalDateTime).toLocaleString()}</p>
          </div>
          
          <p>You can now view your PL card with QR code in your student portal.</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/student/pl-history" class="button">View PL Card</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plRejectedByWardenEmail = (studentName, parentEmail, plDetails, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #dc3545; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✗ Permission Letter Rejected by Warden</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your permission letter request has been <strong>rejected by the warden</strong>.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Reason for Rejection:</strong> ${reason}</p>
          </div>
          
          <p>Please contact the warden for more information.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const forgotPasswordEmail = (email, tempPassword) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #667eea; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .password-box { background-color: white; padding: 20px; margin-top: 20px; border: 2px solid #667eea; border-radius: 8px; text-align: center; }
        .password-display { font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 2px; margin: 15px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 15px; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #667eea; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your account. Your temporary password is below:</p>
          
          <div class="password-box">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Temporary Password:</p>
            <div class="password-display">${tempPassword}</div>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Please copy this password carefully</p>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Important Security Notice:</strong></p>
            <ul>
              <li>Do not share this password with anyone</li>
              <li>Log in with this temporary password immediately</li>
              <li>Change your password to a new one in your account settings after login</li>
              <li>This temporary password will expire in 24 hours</li>
            </ul>
          </div>
          
          <p style="margin-top: 20px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Go to Login</a>
          </p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            If you did not request a password reset, please ignore this email and ensure your account is secure. If you have concerns about your account, contact support immediately.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const outpassCreatedEmail = (studentName, placeOfVisit) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #3b82f6; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #3b82f6; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Outpass Created Successfully</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your outpass has been created successfully!</p>
          
          <div class="details">
            <h3>Outpass Details:</h3>
            <p><strong>Place of Visit:</strong> ${placeOfVisit}</p>
            <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Active</span></p>
            <p><strong>Created At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>You can now view your outpass QR code in your student portal. Please show this QR code at the hostel gate when exiting.</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/outpass" class="button">View Outpass</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const outpassCompletedEmail = (studentName, placeOfVisit) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Outpass Completed</h2>
        </div>
        <div class="content">
          <p>Dear ${studentName},</p>
          <p>Your outpass has been marked as completed. Welcome back to the hostel!</p>
          
          <div class="details">
            <h3>Outpass Summary:</h3>
            <p><strong>Place of Visit:</strong> ${placeOfVisit}</p>
            <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Completed</span></p>
            <p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Thank you for using our hostel management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plApprovedByWardenEmailToParent = (studentName, parentName, plDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #059669; }
        .info-box { background-color: #ecfdf5; border: 1px solid #059669; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; background-color: #059669; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Permission Letter Approved</h2>
        </div>
        <div class="content">
          <p>Dear ${parentName},</p>
          <p>We are pleased to inform you that your ward's <strong>${studentName}</strong> permission letter request has been <strong style="color: #059669;">approved by the warden</strong>.</p>
          
          <div class="details">
            <h3>Permission Details:</h3>
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${new Date(plDetails.arrivalDateTime).toLocaleString()}</p>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; color: #065f46;"><strong>✓ Your ward can now proceed with their outing.</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #047857;">Please ensure your ward returns on time as per the approved schedule.</p>
          </div>
          
          <p style="margin-top: 20px;">If you have any concerns, please contact the warden.</p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated notification from Hostel Portal. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const plRejectedByWardenEmailToParent = (studentName, parentName, plDetails, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background-color: #fef2f2; padding: 20px; margin-top: 20px; }
        .details { background-color: white; padding: 15px; margin-top: 15px; border-left: 4px solid #dc2626; }
        .reason-box { background-color: #fee2e2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✗ Permission Letter Rejected</h2>
        </div>
        <div class="content">
          <p>Dear ${parentName},</p>
          <p>We regret to inform you that your ward's <strong>${studentName}</strong> permission letter request has been <strong style="color: #dc2626;">rejected by the warden</strong>.</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Place of Visit:</strong> ${plDetails.placeOfVisit}</p>
            <p><strong>Departure:</strong> ${new Date(plDetails.departureDateTime).toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${new Date(plDetails.arrivalDateTime).toLocaleString()}</p>
          </div>
          
          <div class="reason-box">
            <p style="margin: 0; color: #991b1b;"><strong>Reason for Rejection:</strong></p>
            <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason || 'Not specified'}</p>
          </div>
          
          <p style="margin-top: 20px;">Please discuss with your ward and reapply if needed.</p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated notification from Hostel Portal. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};