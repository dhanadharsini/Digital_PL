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