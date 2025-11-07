import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(formData: ContactFormData): Promise<void> {
  const { name, email, subject, message } = formData;

  const emailParams = {
    Source: 'contact@sleepcoding.me', // Use verified email as sender
    Destination: {
      ToAddresses: ['contact@sleepcoding.me'], // Send to same verified email
    },
    ReplyToAddresses: [email], // Allow direct reply to the sender
    Message: {
      Subject: {
        Data: `Contact Form: ${subject}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>New Contact Form Submission</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                  New Contact Form Submission
                </h2>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong style="color: #1e293b;">Name:</strong> ${name}</p>
                  <p><strong style="color: #1e293b;">Email:</strong> <a href="mailto:${email}" style="color: #0369a1;">${email}</a></p>
                  <p><strong style="color: #1e293b;">Subject:</strong> ${subject}</p>
                </div>
                
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h3 style="color: #1e293b; margin-top: 0;">Message:</h3>
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                  <p>This message was sent from the SleepCoding contact form.</p>
                  <p>Timestamp: ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
        Text: {
          Data: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the SleepCoding contact form.
Timestamp: ${new Date().toLocaleString()}
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw new Error('Failed to send email');
  }
}

// Optional: Send confirmation email to the user
// Note: This will only work if the user's email domain is verified in SES
export async function sendConfirmationEmail(_userEmail: string, _userName: string): Promise<void> {
  // Skip confirmation email for now since we're in sandbox mode
  // Parameters prefixed with _ to indicate intentionally unused
  // and can only send to verified addresses
  return;
  
  // Uncomment this when you move out of sandbox mode:
  /*
  const emailParams = {
    Source: 'contact@sleepcoding.me',
    Destination: {
      ToAddresses: [userEmail],
    },
    Message: {
      Subject: {
        Data: 'Thank you for contacting SleepCoding',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Thank you for contacting us</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e293b;">Thank you for contacting us!</h2>
                
                <p>Dear ${userName},</p>
                
                <p>We have received your message and will get back to you within 24 hours during business days.</p>
                
                <p>If you have any urgent questions, you can also reach us at:</p>
                <ul>
                  <li>Phone: 207-358-9026</li>
                  <li>Email: contact@sleepcoding.me</li>
                </ul>
                
                <p>Best regards,<br>The SleepCoding Team</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                  <p>Sleep Coder LLC<br>
                  PO BOX 2803<br>
                  South Portland, ME 04116</p>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error for confirmation email - it's not critical
  }
  */
}
