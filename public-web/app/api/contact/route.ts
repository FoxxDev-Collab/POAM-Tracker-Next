import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; border-top: none; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #495057; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 5px; border: 1px solid #dee2e6; }
            .footer { background: #343a40; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
            .badge { display: inline-block; padding: 5px 10px; background: #28a745; color: white; border-radius: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🚀 New Contact Form Submission</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Bedrock Security Platform</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              ${subject ? `
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                <p style="color: #6c757d; font-size: 14px;">
                  <strong>Submission Time:</strong> ${new Date().toLocaleString('en-US', {
                    timeZone: 'America/Denver',
                    dateStyle: 'full',
                    timeStyle: 'medium'
                  })} (Mountain Time)
                </p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">This email was sent from the Bedrock Security Platform contact form.</p>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">© 2025 Bedrock Security Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
New Contact Form Submission - Bedrock Security Platform

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}${subject ? `Subject: ${subject}\n` : ''}
Message:
${message}

---
Submission Time: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/Denver',
  dateStyle: 'full',
  timeStyle: 'medium'
})} (Mountain Time)

This email was sent from the Bedrock Security Platform contact form.
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Bedrock Contact Form" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_TO || 'foxxdev.collab@gmail.com',
      replyTo: email,
      subject: subject || `New Contact Form Submission from ${name}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Message sent: %s', info.messageId);

    // Send auto-reply to the user
    if (process.env.SMTP_FROM) {
      const autoReplyHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; border-top: none; }
              .footer { background: #343a40; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Thank You for Contacting Bedrock</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message!</p>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to Bedrock Security Platform. We've successfully received your message and appreciate your interest in our RMF-native compliance platform.</p>
                <p>Our team will review your inquiry and get back to you within 1-2 business days. We're excited to discuss how Bedrock can transform your organization's approach to cybersecurity compliance.</p>
                <p>In the meantime, feel free to explore more about our platform:</p>
                <ul>
                  <li><a href="https://your-domain.com/product">Product Features</a></li>
                  <li><a href="https://your-domain.com/about">About Us</a></li>
                  <li><a href="https://your-domain.com/acquisition">Strategic Opportunities</a></li>
                </ul>
                <p>Best regards,<br>
                <strong>Jeremiah Price</strong><br>
                Founder & CEO<br>
                Bedrock Security Platform</p>
              </div>
              <div class="footer">
                <p style="margin: 0;">© 2025 Bedrock Security Platform. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">The world's first RMF-native compliance platform</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Bedrock Security Platform" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Thank you for contacting Bedrock Security Platform',
        html: autoReplyHtml,
      });
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}