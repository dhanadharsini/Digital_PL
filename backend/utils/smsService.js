import twilio from 'twilio';
import axios from 'axios';

class SMSService {
  constructor() {
    // Twilio configuration
    this.twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
      ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      : null;
    this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    // WhatsApp configuration - Use sandbox or custom number
    const customWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    this.whatsappFrom = customWhatsappNumber || 'whatsapp:+14155238886';

    if (this.twilioClient) {
      console.log('✅ Twilio SMSService initialized successfully');
      console.log(`📡 WhatsApp Number: ${this.whatsappFrom}`);
    } else {
      console.warn('⚠️ Twilio SMSService failed to initialize - missing credentials');
      if (!process.env.TWILIO_ACCOUNT_SID) console.warn('   - Missing TWILIO_ACCOUNT_SID');
      if (!process.env.TWILIO_AUTH_TOKEN) console.warn('   - Missing TWILIO_AUTH_TOKEN');
    }

    // MSG91 configuration
    this.msg91AuthKey = process.env.MSG91_AUTH_KEY;
    this.msg91SenderId = process.env.MSG91_SENDER_ID || 'HOSTEL';
  }

  /**
   * Format phone number to E.164 standard
   */
  formatPhoneNumber(to) {
    // Cleanup: Remove any whitespace, dashes, parens, or prefixes
    let clean = to.toString().trim().replace(/[\s\-()]/g, '').replace('whatsapp:', '');
    
    // Ensure it starts with '+'
    if (!clean.startsWith('+')) {
      // Remove leading zero if present
      if (clean.startsWith('0')) clean = clean.substring(1);
      
      // Default to India (+91) if 10 digits
      if (clean.length === 10) {
        clean = `+91${clean}`;
      } else if (clean.length === 12 && clean.startsWith('91')) {
        clean = `+${clean}`;
      } else {
        clean = `+${clean}`;
      }
    }
    return clean;
  }

  /**
   * Send WhatsApp message via Twilio
   */
  async sendWhatsApp(to, message) {
    try {
      if (!this.twilioClient) {
        console.log('⚠️ Twilio not configured - skipping WhatsApp');
        return false;
      }

      const formattedTo = this.formatPhoneNumber(to);
      const whatsappTo = `whatsapp:${formattedTo}`;
      
      console.log(`\n--- Twilio WhatsApp Dispatch ---`);
      console.log(`To: ${whatsappTo}`);
      console.log(`From: ${this.whatsappFrom}`);
      
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.whatsappFrom,
        to: whatsappTo
      });

      console.log(`✅ WhatsApp message sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('❌ WhatsApp failed!');
      console.error('   Message:', error.message);
      if (error.code) console.error('   Error Code:', error.code);
      
      if (error.code === 21608 || error.code === 63015) {
        console.error('   💡 TIP: Recipient has not joined the WhatsApp sandbox.');
      }
      
      throw error;
    }
  }

  /**
   * Send SMS using Twilio
   */
  async sendViaTwilio(to, message) {
    try {
      if (!this.twilioClient) {
        console.log('⚠️ Twilio not configured - skipping SMS');
        return false;
      }

      const formattedTo = this.formatPhoneNumber(to);
      console.log(`\n--- Twilio SMS Dispatch ---`);
      console.log(`To: ${formattedTo}`);
      console.log(`From: ${this.twilioPhone}`);

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhone,
        to: formattedTo
      });

      console.log(`✅ Twilio SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('❌ Twilio SMS failed:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS using MSG91
   */
  async sendViaMSG91(to, message) {
    try {
      if (!this.msg91AuthKey) {
        console.log('⚠️ MSG91 not configured - skipping SMS');
        return false;
      }

      // Format phone number for India (add 91 if not present)
      const formattedPhone = to.startsWith('91') ? to : `91${to}`;

      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {
          otp: message.split(':')[1]?.trim() || message,
          mobile: formattedPhone,
          sender: this.msg91SenderId,
          authkey: this.msg91AuthKey,
          short_url: 1
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ MSG91 SMS sent successfully:`, response.data);
      return true;
    } catch (error) {
      console.error('❌ MSG91 SMS failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send OTP via WhatsApp or SMS
   */
  async sendOTP(phoneNumber, otp, provider = 'whatsapp') {
    const message = `🔐 *Hostel Portal OTP*\n\nYour OTP is: *${otp}*\n\nValid for 5 minutes.\n\n⚠️ Do not share this with anyone.`;

    try {
      if (provider === 'whatsapp') {
        try {
          const success = await this.sendWhatsApp(phoneNumber, message);
          if (success) return true;
        } catch (whatsappError) {
          console.log('⚠️ WhatsApp error caught, attempting fallback to SMS...');
        }
        
        // If we're here, either sendWhatsApp returned false or it threw an error
        console.log('⚠️ WhatsApp unavailable - attempting fallback to Twilio SMS...');
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (provider === 'msg91') {
        return await this.sendViaMSG91(phoneNumber, message);
      } else {
        console.error('❌ Invalid provider specified');
        return false;
      }
    } catch (error) {
      console.error('❌ Final message sending failure:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
