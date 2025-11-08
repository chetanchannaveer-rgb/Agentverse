import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import type { StudyScheduleItem, StudyScheduleWithEmail } from '@shared/schema';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';

type EmailProvider = 'gmail-app-password' | 'gmail-oauth2' | 'resend' | 'demo';

export class EmailService {
  private resend: Resend | null = null;
  private gmailTransporter: any = null;
  private provider: EmailProvider = 'demo';
  private enabled: boolean = false;
  private fromEmail: string = '';

  constructor() {
    this.initializeEmailProvider();
  }

  private initializeEmailProvider() {
    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      try {
        this.gmailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD,
          },
        });
        this.provider = 'gmail-app-password';
        this.fromEmail = GMAIL_USER;
        this.enabled = true;
        console.log('✉️  Email service initialized with Gmail (App Password)');
        return;
      } catch (error) {
        console.warn('Failed to initialize Gmail with App Password:', error);
      }
    }

    if (GMAIL_USER && GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
      try {
        this.gmailTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: GMAIL_USER,
            clientId: GMAIL_CLIENT_ID,
            clientSecret: GMAIL_CLIENT_SECRET,
            refreshToken: GMAIL_REFRESH_TOKEN,
          },
        });
        this.provider = 'gmail-oauth2';
        this.fromEmail = GMAIL_USER;
        this.enabled = true;
        console.log('✉️  Email service initialized with Gmail (OAuth2)');
        return;
      } catch (error) {
        console.warn('Failed to initialize Gmail with OAuth2:', error);
      }
    }

    if (RESEND_API_KEY && RESEND_API_KEY !== '') {
      try {
        this.resend = new Resend(RESEND_API_KEY);
        this.provider = 'resend';
        this.fromEmail = FROM_EMAIL;
        this.enabled = true;
        console.log('✉️  Email service initialized with Resend');
        return;
      } catch (error) {
        console.warn('Failed to initialize Resend:', error);
      }
    }

    console.log('📧 Email service running in DEMO mode');
    console.log('   To enable email notifications, add one of the following to Replit Secrets:');
    console.log('   • Gmail App Password: GMAIL_USER + GMAIL_APP_PASSWORD');
    console.log('   • Gmail OAuth2: GMAIL_USER + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN');
    console.log('   • Resend: RESEND_API_KEY + FROM_EMAIL');
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.enabled) {
      console.log(`[DEMO] Would send email to ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      return true;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              ${body.replace(/\n/g, '<br>')}
            </div>
          </div>
        </body>
      </html>
    `;

    if (this.provider === 'gmail-app-password' || this.provider === 'gmail-oauth2') {
      return this.sendViaGmail(to, subject, html, 0);
    } else if (this.provider === 'resend' && this.resend) {
      return this.sendViaResend(to, subject, html, 0);
    }

    console.error('❌ No email provider configured');
    return false;
  }

  async sendWelcomeEmail(schedule: StudyScheduleWithEmail): Promise<boolean> {
    if (!this.enabled) {
      console.log(`[DEMO] Would send welcome email to ${schedule.studentEmail}`);
      console.log(`Subject: Welcome to ${schedule.topic}!`);
      return true;
    }

    const html = this.generateWelcomeEmailHTML(schedule);
    const subject = `Welcome to Your Learning Journey: ${schedule.topic}`;

    if (this.provider === 'gmail-app-password' || this.provider === 'gmail-oauth2') {
      return this.sendViaGmail(schedule.studentEmail, subject, html, 0);
    } else if (this.provider === 'resend' && this.resend) {
      return this.sendViaResend(schedule.studentEmail, subject, html, 0);
    }

    console.error('❌ No email provider configured');
    return false;
  }

  async sendDailyScheduleEmail(
    schedule: StudyScheduleWithEmail,
    dayItem: StudyScheduleItem
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log(`[DEMO] Would send email to ${schedule.studentEmail} for Day ${dayItem.day}`);
      console.log(`Subject: Day ${dayItem.day}: ${dayItem.title}`);
      console.log(`Topics: ${dayItem.topics.join(', ')}`);
      return true;
    }

    const html = this.generateScheduleEmailHTML(schedule, dayItem);
    const subject = `${schedule.topic} - Day ${dayItem.day}: ${dayItem.title}`;

    if (this.provider === 'gmail-app-password' || this.provider === 'gmail-oauth2') {
      return this.sendViaGmail(schedule.studentEmail, subject, html, dayItem.day);
    } else if (this.provider === 'resend' && this.resend) {
      return this.sendViaResend(schedule.studentEmail, subject, html, dayItem.day);
    }

    console.error('❌ No email provider configured');
    return false;
  }

  private async sendViaGmail(
    to: string,
    subject: string,
    html: string,
    day: number
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html,
      };

      const result = await this.gmailTransporter.sendMail(mailOptions);
      console.log(`✅ Sent email via Gmail to ${to} for Day ${day}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send Gmail to ${to}:`, error);
      return false;
    }
  }

  private async sendViaResend(
    to: string,
    subject: string,
    html: string,
    day: number
  ): Promise<boolean> {
    try {
      if (!this.resend) {
        throw new Error('Resend not initialized');
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      console.log(`✅ Sent email via Resend to ${to} for Day ${day}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send Resend email to ${to}:`, error);
      return false;
    }
  }

  private generateWelcomeEmailHTML(schedule: StudyScheduleWithEmail): string {
    const totalDays = schedule.schedule.length;
    const firstDay = schedule.schedule[0];
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${schedule.topic}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 20px;
    }
    .welcome-message {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      line-height: 1.7;
    }
    .schedule-overview {
      background: #f0f0f1;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .schedule-overview h3 {
      margin: 0 0 15px 0;
      color: #667eea;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .next-lesson {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
    }
    .next-lesson h3 {
      margin: 0 0 10px 0;
      color: #667eea;
    }
    .topics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .topic-tag {
      background: white;
      color: #4a4a4a;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #e0e0e0;
    }
    .tips {
      background: #fafafa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .tips h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    .tips ul {
      margin: 0;
      padding-left: 20px;
      color: #555;
    }
    .tips li {
      margin: 8px 0;
    }
    .footer {
      background: #fafafa;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .footer p {
      margin: 5px 0;
      color: #666;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Your Learning Journey!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">You're enrolled in ${schedule.topic}</p>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <p>Congratulations on taking the first step towards mastering <strong>${schedule.topic}</strong>! 🚀</p>
        <p>We've created a personalized ${totalDays}-day learning plan just for you. Each day, you'll receive an email with carefully curated content to guide your learning journey.</p>
      </div>

      <div class="schedule-overview">
        <h3>📋 Your Learning Plan Overview</h3>
        <div class="info-row">
          <span class="info-label">Total Duration:</span>
          <span class="info-value">${schedule.totalDuration}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Daily Commitment:</span>
          <span class="info-value">~${schedule.estimatedHoursPerDay} hours per day</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Days:</span>
          <span class="info-value">${totalDays} days</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next Email:</span>
          <span class="info-value">Tomorrow at 9:00 AM</span>
        </div>
      </div>

      ${firstDay ? `
      <div class="next-lesson">
        <h3>📚 Tomorrow's Lesson Preview</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Day 1: ${firstDay.title}</strong></p>
        <p style="margin: 10px 0 5px 0; font-size: 14px; color: #666;">Topics you'll cover:</p>
        <div class="topics">
          ${firstDay.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      ${schedule.tips && schedule.tips.length > 0 ? `
      <div class="tips">
        <h3>💡 Tips for Success</h3>
        <ul>
          ${schedule.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⏰ Daily Email Schedule:</strong> Starting tomorrow, you'll receive your daily lesson at 9:00 AM. Make sure to check your inbox regularly!
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Get ready to start your journey tomorrow! 🌟</strong></p>
      <p style="color: #888; font-size: 12px; margin-top: 10px;">
        You're receiving this because you enrolled in "${schedule.topic}"
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateScheduleEmailHTML(
    schedule: StudyScheduleWithEmail,
    dayItem: StudyScheduleItem
  ): string {
    const totalDays = schedule.schedule.length;
    const progressPercentage = Math.round((dayItem.day / totalDays) * 100);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schedule.topic} - Day ${dayItem.day}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .progress-bar {
      background: rgba(255,255,255,0.3);
      height: 8px;
      border-radius: 4px;
      margin-top: 15px;
      overflow: hidden;
    }
    .progress-fill {
      background: white;
      height: 100%;
      width: ${progressPercentage}%;
      transition: width 0.3s ease;
    }
    .content {
      padding: 30px 20px;
    }
    .day-badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    .day-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 10px 0;
    }
    .duration {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 25px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .topics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .topic-tag {
      background: #f0f0f1;
      color: #4a4a4a;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
    }
    .description {
      background: #fafafa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
      color: #444;
      line-height: 1.7;
    }
    .footer {
      background: #fafafa;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .footer p {
      margin: 5px 0;
      color: #666;
      font-size: 13px;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 ${schedule.topic}</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Your Learning Journey - Day ${dayItem.day} of ${totalDays}</p>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
    
    <div class="content">
      <span class="day-badge">Day ${dayItem.day}</span>
      <h2 class="day-title">${dayItem.title}</h2>
      <p class="duration">⏱️ Estimated Time: ${dayItem.duration}</p>
      
      <h3 class="section-title">📖 Today's Topics</h3>
      <div class="topics">
        ${dayItem.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
      </div>
      
      <h3 class="section-title">📝 What You'll Learn</h3>
      <div class="description">
        ${dayItem.description}
      </div>
      
      ${schedule.tips && schedule.tips.length > 0 ? `
      <h3 class="section-title">💡 Study Tips</h3>
      <ul style="color: #555; line-height: 1.8;">
        ${schedule.tips.slice(0, 3).map(tip => `<li>${tip}</li>`).join('')}
      </ul>
      ` : ''}
    </div>
    
    <div class="footer">
      <p><strong>Keep going! You're ${progressPercentage}% through your learning journey.</strong></p>
      <p style="color: #888; font-size: 12px;">
        You're receiving this because you enrolled in "${schedule.topic}"
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getProvider(): EmailProvider {
    return this.provider;
  }
}

export const emailService = new EmailService();
