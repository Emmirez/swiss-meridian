import twilio from "twilio";

let client = null;
const sidLooksValid = process.env.TWILIO_ACCOUNT_SID?.startsWith("AC");

if (sidLooksValid && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn("Twilio client could not be initialized:", err.message);
  }
} else if (process.env.TWILIO_ACCOUNT_SID) {
  console.warn("TWILIO_ACCOUNT_SID is set but doesn't look valid (must start with 'AC') — SMS sending disabled.");
}

export const sendSms = async ({ to, body }) => {
  if (!client) {
    console.warn("Twilio not configured — skipping SMS send. Would have sent:", body, "to", to);
    return { skipped: true };
  }

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("SMS send error:", error.message);
    return { success: false, error: error.message };
  }
};
