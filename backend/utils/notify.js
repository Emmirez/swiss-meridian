import Notification from "../models/Notification.js";
import { sendEmail, transactionEmailTemplate, generalEmailTemplate } from "./sendEmail.js";
import { sendSms } from "./sendSms.js";
import { getIO } from "../socket.js";

/**
 * Sends a transaction notification across email, SMS, and in-app channels,
 * and pushes a real-time event via Socket.io if the user is connected.
 */
export const notifyTransaction = async (
  user,
  { action, amount, currency, balance, reference, date },
) => {
  const title = `Transaction: ${action} ${currency} ${amount}`;
  const message = `Your account was ${action} ${currency} ${amount}. New balance: ${currency} ${balance}. Ref: ${reference}`;

  // 1. In-app (persisted)
  const notification = await Notification.create({
    user: user._id,
    title,
    message,
    type: "transaction",
    channels: {
      email: user.notificationPrefs?.email ?? true,
      sms: user.notificationPrefs?.sms ?? true,
      inApp: true,
    },
    meta: { amount, currency, balance, reference },
  });

  // 2. Real-time push over socket (if user is online)
  try {
    const io = getIO();
    io.to(user._id.toString()).emit("notification", notification);
  } catch (err) {
    // socket may not be initialized in some contexts (e.g. scripts) — safe to ignore
  }

  // 3. Email
  if (user.notificationPrefs?.email !== false) {
    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: title,
      html: transactionEmailTemplate({
        name: user.firstName,
        action,
        amount,
        currency,
        balance,
        reference,
        date,
      }),
    });
  }

  // 4. SMS
  if (user.notificationPrefs?.sms !== false && user.phone) {
    await sendSms({
      to: user.phone,
      body: `Swiss Meridian Bank: ${action} ${currency}${amount}. Bal: ${currency}${balance}. Ref: ${reference}`,
    });
  }

  return notification;
};


/**
 * Generic notification across in-app, email, and SMS channels. The caller's
 * email/sms flags mark a notification as eligible for that channel; the
 * user's own saved Notification Preferences have final say on whether it
 * actually sends.
 */
export const notifyGeneral = async (
  user,
  { title, message, type = "general", email = false, sms = false },
) => {
  const shouldEmail = email && (user.notificationPrefs?.email ?? true);
  const shouldSms = sms && (user.notificationPrefs?.sms ?? true);

  const notification = await Notification.create({
    user: user._id,
    title,
    message,
    type,
    channels: { email: shouldEmail, sms: shouldSms, inApp: true },
  });

  try {
    const io = getIO();
    io.to(user._id.toString()).emit("notification", notification);
  } catch (err) {
    // ignore if socket not ready
  }

  if (shouldEmail) {
    await sendEmail({
      to: user.email,
      toName: user.firstName,
      subject: title,
      html: generalEmailTemplate({ name: user.firstName, title, message }),
    });
  }

  if (shouldSms && user.phone) {
    await sendSms({
      to: user.phone,
      body: `${title}: ${message}`,
    });
  }

  return notification;
};