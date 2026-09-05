// Sends transactional email via Brevo (Sendinblue) HTTP API
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async ({ to, toName, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured — cannot send email.");
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Swiss Meridian Bank",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Brevo email send failed:", errText);
      return { success: false, error: errText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

// --- Shared branded email shell ---

const NAVY = "#0B2545";
const GOLD = "#C9A227";
const SLATE = "#64748B";
const LOGO_URL = "https://swissmeridianapp.com/logo.png";

export const emailShell = (bodyHtml) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; background:#ffffff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden;">

    <!-- Header -->
    <div style="background:${NAVY}; padding: 24px 28px;">
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${LOGO_URL}" alt="Swiss Meridian Bank" width="36" height="36" style="display:block; border-radius:8px;" />
          </td>
          <td style="vertical-align:middle; padding-left:10px;">
            <span style="font-size:18px; font-weight:bold; color:#ffffff;">Swiss Meridian</span>
            <span style="font-size:18px; font-weight:bold; color:${GOLD};"> Bank</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="height:4px; background:${GOLD};"></div>

    <!-- Body -->
    <div style="padding: 28px;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb; padding: 20px 28px; background:#f8fafc;">
      <p style="margin:0 0 4px 0; font-size:12px; font-weight:bold; color:${NAVY};">Swiss Meridian Bank</p>
      <p style="margin:0 0 4px 0; font-size:11px; color:${SLATE};">Rue des Alpes 141201 Geneva Switzerland</p>
      <p style="margin:0 0 12px 0; font-size:11px; color:${SLATE};">support@swissmeridianapp.com &nbsp;·&nbsp; 1-800-SWISS-01</p>
      <p style="margin:0; font-size:10px; color:${SLATE}; line-height:1.5;">
        <p style="margin:16px 0 0 0; color:${SLATE}; font-size: 11px;">
      This email is provided for informational purposes only. Swiss Meridian Bank, Member FDIC. Deposits insured up to $250,000 per depositor, per ownership category.
      </p>
      </p>
    </div>
  </div>
`;

// --- Email templates ---

export const otpEmailTemplate = (name, otp) =>
  emailShell(`
  <p style="margin:0 0 16px 0; color:#111827;">Hi ${name},</p>

  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:20px; margin-bottom:16px; text-align:center;">
    <p style="margin:0 0 8px 0; font-weight:bold; color:#2563eb; font-size:14px;">Your Verification Code</p>
    <p style="margin:0; font-size: 34px; font-weight: bold; letter-spacing: 8px; color:${NAVY};">${otp}</p>
  </div>

  <p style="margin:0 0 16px 0; color:#374151; font-size:14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>

  <p style="color:${SLATE}; font-size: 12px; margin:0;">Swiss Meridian Bank never asks for your password or PIN by email.</p>
`);

const formatMoney = (amount, currency) => {
  const num = Number(amount) || 0;
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const generalEmailTemplate = ({ name, title, message }) =>
  emailShell(`
  <p style="margin:0 0 16px 0; color:#111827;">Hi ${name},</p>

  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px; margin-bottom:16px;">
    <p style="margin:0; font-weight:bold; color:#2563eb; font-size:15px;">${title}</p>
  </div>

  <p style="margin:0; color:#111827;">${message}</p>
`);

export const transactionEmailTemplate = ({
  name,
  action,
  amount,
  currency,
  balance,
  reference,
  date,
  category,
}) => {
  const isCredit = action === "credited";
  const historyUrl = "https://swissmeridianapp.com/dashboard/transactions";

  const isAdjustment = category === "Admin Adjustment";
  const bannerLabel = isAdjustment
    ? isCredit
      ? "Balance Credited"
      : "Balance Debited"
    : isCredit
      ? "✓ Deposit Confirmed"
      : "Payment Sent";

  return emailShell(`
    <p style="margin:0 0 16px 0; color:#111827;">Dear ${name},</p>

    <div style="background:${isCredit ? "#ecfdf5" : "#fef2f2"}; border:1px solid ${isCredit ? "#a7f3d0" : "#fecaca"}; border-radius:10px; padding:16px; margin-bottom:16px;">
      <p style="margin:0; font-weight:bold; color:${isCredit ? "#059669" : "#dc2626"}; font-size:15px;">
        ${bannerLabel}
      </p>
      <p style="margin:4px 0 0 0; color:#111827; font-size:20px; font-weight:bold;">
        ${isCredit ? "+" : "-"}${formatMoney(amount, currency)}
      </p>
    </div>

    <p style="margin:0 0 16px 0; color:#111827;">Your Swiss Meridian Bank account has been <strong>${action}</strong> in the amount of <strong>${formatMoney(amount, currency)}</strong>.</p>

    <table style="width:100%; font-size: 14px; color:#374151; border-collapse:collapse;">
      <tr><td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">Transaction Reference</td><td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${reference}</td></tr>
      <tr><td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">Date &amp; Time</td><td style="padding:8px 0; border-bottom:1px solid #f1f5f9; text-align:right;">${date}</td></tr>
      <tr><td style="padding:8px 0;">Current Balance</td><td style="padding:8px 0; text-align:right; font-weight:bold; color:${NAVY};">${formatMoney(balance, currency)}</td></tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:20px;">
      <tr>
        <td align="center">
          <a href="${historyUrl}" style="display:inline-block; background:${NAVY}; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 28px; border-radius:10px;">
            View Transaction History
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0 0; color:${SLATE}; font-size: 12px;">If you did not authorize this transaction, please contact support immediately.</p>
    <p style="margin:8px 0 0 0; color:${SLATE}; font-size: 11px;">Swiss Meridian Bank, Member FDIC. Deposits insured up to $250,000 per depositor, per ownership category.</p>
    <p style="margin:4px 0 0 0; color:${SLATE}; font-size: 11px;">This is an automated notification. Please do not reply to this email.</p>
  `);
};

export const approvalEmailTemplate = (name, status) => {
  const isApproved = status === "active";
  const loginUrl = "https://swissmeridianapp.com/login";

  return emailShell(`
    <p style="margin:0 0 16px 0; color:#111827;">Hi ${name},</p>

    <div style="background:${isApproved ? "#ecfdf5" : "#fef2f2"}; border:1px solid ${isApproved ? "#a7f3d0" : "#fecaca"}; border-radius:10px; padding:16px; margin-bottom:16px;">
      <p style="margin:0; font-weight:bold; color:${isApproved ? "#059669" : "#dc2626"}; font-size:15px;">
        ${isApproved ? "✓ Account Approved" : "Application Not Approved"}
      </p>
    </div>

    ${
      isApproved
        ? `<p style="margin:0 0 20px 0; color:#111827;">Great news — your Swiss Meridian Bank account has been approved and is now active. You can log in and start banking right away.</p>`
        : `<p style="margin:0 0 20px 0; color:#111827;">We were unable to approve your account application at this time. Please contact our support team for more information.</p>`
    }

    ${
      isApproved
        ? `<table style="width:100%; border-collapse:collapse;">
             <tr>
               <td align="center">
                 <a href="${loginUrl}" style="display:inline-block; background:${NAVY}; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 28px; border-radius:10px;">
                   Log In to Your Account
                 </a>
               </td>
             </tr>
           </table>`
        : `<table style="width:100%; border-collapse:collapse;">
             <tr>
               <td align="center">
                 <a href="https://swissmeridianapp.com/contact" style="display:inline-block; background:${NAVY}; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 28px; border-radius:10px;">
                   Contact Support
                 </a>
               </td>
             </tr>
           </table>`
    }
  `);
};

export const jointInviteEmailTemplate = ({
  inviteeName,
  primaryName,
  accountType,
  inviteUrl,
}) =>
  emailShell(`
  <p style="margin:0 0 16px 0; color:#111827;">Hi ${inviteeName},</p>

  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px; margin-bottom:16px;">
    <p style="margin:0; font-weight:bold; color:#2563eb; font-size:15px;">You've Been Invited</p>
  </div>

  <p style="margin:0 0 16px 0; color:#111827;">
    <strong>${primaryName}</strong> has invited you to be a joint holder on a
    <strong>${accountType.replace("_", " ")}</strong> account with Swiss Meridian Bank.
    As a joint holder, you'll have full access to view and manage the account, including transfers,
    bill payments, and card requests.
  </p>

  <p style="margin:0 0 20px 0; color:#111827;">To accept, complete your own quick registration below:</p>

  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td align="center">
        <a href="${inviteUrl}" style="display:inline-block; background:${NAVY}; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 28px; border-radius:10px;">
          Complete Registration
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:20px 0 0 0; color:${SLATE}; font-size: 12px;">This invite expires in 7 days. If you weren't expecting this, you can safely ignore this email.</p>
`);
