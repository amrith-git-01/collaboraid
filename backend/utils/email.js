const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url || null;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    }
    return null;
  }
  async sendViaBrevo(subject, htmlContent, textContent) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const emailData = {
      sender: {
        email: this.from,
        name: 'Collaboraid Team',
      },
      to: [
        {
          email: this.to,
          name: this.name,
        },
      ],
      subject,
      htmlContent,
      textContent,
    };

    const response = await apiInstance.sendTransacEmail(emailData);

  }

  async send(template, subject) {
    const text = convert(template);

    if (process.env.NODE_ENV === 'production') {
      await this.sendViaBrevo(subject, template, text);
    } else {
      const transport = this.newTransport();
      if (!transport) {
        throw new Error('Email transport not configured for development');
      }

      await transport.sendMail({
        from: this.from,
        to: this.to,
        subject,
        html: template,
        text,
      });
    }
  }

  async sendWelcome() {
    const mailTemplate = `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafaf9; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); box-sizing: border-box;">

    <!-- Logo -->
    <div style="text-align: center; padding: 20px 0;">
      <img src="https://i.imgur.com/JWATyOV.png" alt="Collaboraid Logo" style="max-width: 100px; height: auto;">
    </div>

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 15px;">Welcome to Collaboraid!</h1>
      <p style="font-size: 16px; line-height: 1.5;">
        Hi <strong>${this.firstName}</strong>,<br>
        We're excited to have you on board! Collaboraid helps you create, join, and collaborate on amazing events with your community.
      </p>
      <a href="${this.url}" style="background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: 600; border-radius: 25px; font-size: 16px; display: inline-block; margin-top: 20px; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
        Explore Events Now
      </a>
    </div>

    <!-- Feature Highlights -->
    <div style="background-color: #ffffff; padding: 25px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
      <h2 style="font-size: 20px; color: #111827; margin-bottom: 15px; text-align: center;">What You Can Do with Collaboraid:</h2>
      <ul style="list-style: none; padding: 0; margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
        <li style="margin-bottom: 10px;">✅ Create and manage events easily</li>
        <li style="margin-bottom: 10px;">✅ Invite collaborators and share responsibilities</li>
        <li style="margin-bottom: 10px;">✅ Track tasks, progress, and updates in real time</li>
        <li style="margin-bottom: 10px;">✅ Get notified and stay in sync with your team</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 0; font-size: 13px; color: #9ca3af; margin-top: 25px;">
      <p style="margin-bottom: 10px;">Follow us for updates and tips:</p>
      <p style="margin: 0;">
        <a href="https://linkedin.com/in/amrith-bharath-v-s-278542258/" style="color: #9333ea; text-decoration: none; margin: 0 6px;">LinkedIn</a> |
        <a href="https://github.com/amrith-git-01" style="color: #9333ea; text-decoration: none; margin: 0 6px;">GitHub</a>
      </p>
    </div>
  </div>
  `;
    const subject = 'Welcome to Collaboraid!';
    await this.send(mailTemplate, subject);
  }

  async sendPasswordReset() {
    const mailTemplate = `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafaf9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08); box-sizing: border-box;">

        <!-- Logo -->
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://i.imgur.com/JWATyOV.png" alt="Collaboraid Logo" style="max-width: 100px; height: auto;">
        </div>
    
        <!-- Password Reset Panel -->
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${this.firstName}</strong>,<br>
            We received a request to reset your Collaboraid account password. Click the button below to proceed. This link will expire in 10 minutes.
          </p>
          <a href="${this.url}" style="background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 25px; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);">
            Reset Password
          </a>
        </div>
    
        <!-- Info Message -->
        <div style="background-color: #ffffff; padding: 20px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);">
          <p style="font-size: 14px; color: #374151; line-height: 1.6;">
            If you did not request this password reset, you can safely ignore this email. For any concerns, contact our support team.
          </p>
        </div>
    
        <!-- Footer -->
        <div style="text-align: center; padding: 15px 0; font-size: 14px; color: #9ca3af; margin-top: 20px;">
          <p style="margin-bottom: 10px;">Stay connected:</p>
          <p style="margin: 0;">
            <a href="https://linkedin.com/in/amrith-bharath-v-s-278542258/" style="color: #9333ea; text-decoration: none; margin: 0 5px;">LinkedIn</a> |
            <a href="https://github.com/amrith-git-01" style="color: #9333ea; text-decoration: none; margin: 0 5px;">GitHub</a>
          </p>
        </div>
      </div>
    
      <!--Responsive -->
            <style>
                @media screen and (max-width: 600px) {
                    div[style *= "max-width: 600px"] {
                    padding: 10px !important;
          }
                h1 {
                    font - size: 20px !important;
          }
                p {
                    font - size: 14px !important;
          }
                a {
                    font - size: 14px !important;
                padding: 10px 20px !important;
          }
                img {
                    width: 80px !important;
          }
        }
            </style>
        `;
    const subject = 'Reset your password';
    await this.send(mailTemplate, subject);
  }

  async sendContactMessage(contactData) {
    const mailTemplate = `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafaf9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08); box-sizing: border-box;">

        <!-- Logo -->
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://i.imgur.com/JWATyOV.png" alt="Collaboraid Logo" style="max-width: 100px; height: auto;">
        </div>
    
        <!-- Contact Message Header -->
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); color: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">New Contact Form Message</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            You have received a new message from your website contact form. Here are the details:
          </p>
        </div>
    
        <!-- Contact Details -->
        <div style="background-color: #ffffff; padding: 25px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
          <h2 style="font-size: 20px; color: #111827; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contact Information</h2>
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #9333ea; font-size: 14px;">Name:</strong>
            <p style="margin: 5px 0 0 0; color: #374151; font-size: 16px;">${contactData.name}</p>
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #9333ea; font-size: 14px;">Email:</strong>
            <p style="margin: 2px 0 0 0; color: #374151; font-size: 16px;">
              <a href="mailto:${contactData.email}" style="color: #9333ea; text-decoration: none;">${contactData.email}</a>
            </p>
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #9333ea; font-size: 14px;">Subject:</strong>
            <p style="margin: 2px 0 0 0; color: #374151; font-size: 16px;">${contactData.subject}</p>
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong style="color: #9333ea; font-size: 14px;">Message:</strong>
            <div style="margin: 2px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6; background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #9333ea;">
              ${contactData.message}
            </div>
          </div>
        </div>
    
        <!-- Footer -->
        <div style="text-align: center; padding: 15px 0; font-size: 14px; color: #9ca3af; margin-top: 20px;">
          <p style="margin-bottom: 10px;">This message was sent from your website contact form</p>
          <p style="margin: 0;">
            <a href="https://linkedin.com/in/amrith-bharath-v-s-278542258/" style="color: #9333ea; text-decoration: none; margin: 0 5px;">LinkedIn</a> |
            <a href="https://github.com/amrith-git-01" style="color: #9333ea; text-decoration: none; margin: 0 5px;">GitHub</a>
          </p>
        </div>
      </div>
    
      <!-- Responsive -->
      <style>
        @media screen and (max-width: 600px) {
          div[style *= "max-width: 600px"] {
            padding: 5px !important;
          }
          h1 {
            font-size: 20px !important;
            margin-bottom: 15px !important;
          }
          h2 {
            font-size: 18px !important;
            margin-bottom: 15px !important;
          }
          h3 {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          p {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
          a {
            font-size: 14px !important;
            padding: 8px 16px !important;
            margin: 3px !important;
          }
          img {
            width: 80px !important;
          }
          div[style *= "padding: 20px"] {
            padding: 15px !important;
          }
          div[style *= "padding: 25px"] {
            padding: 20px !important;
          }
          div[style *= "padding: 30px"] {
            padding: 20px !important;
          }
          div[style *= "margin-top: 20px"] {
            margin-top: 15px !important;
          }
          div[style *= "margin-bottom: 15px"] {
            margin-bottom: 10px !important;
          }
        }
      </style>
        `;

    const subject = `Contact Message from ${contactData.name}`;
    await this.send(mailTemplate, subject);
  }
}