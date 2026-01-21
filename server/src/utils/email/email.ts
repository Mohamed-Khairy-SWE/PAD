import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import config from '../../config/config';
import { convert } from 'html-to-text';
import { renderEmailTemplate } from './email-template-render';

// Singleton transporter instance
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    const baseConfig = {
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      logger: true,
      debug: true,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    };

    const transportConfig = config.mail.service
      ? {
        ...baseConfig,
        service: config.mail.service,
      }
      : {
        ...baseConfig,
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.port === 465,
      };

    transporter = createTransport(transportConfig);
  }
  return transporter;
};

class Email {
  private to: string;
  private from: string;
  constructor(from: string, to: string) {
    this.from = from;
    this.to = to;
  }

  // Send email using options
  send(emailType: string, subject: string, emailTemplateData: any) {
    // TODO : must be configured and modified
    // const emailTemplateData = {
    //   name: 'ahmed ali',
    //   email:''
    // };
    const html = renderEmailTemplate(emailType, emailTemplateData);
    const mailOptions: SendMailOptions = {
      from: this.from,
      to: this.to,
      html,
      subject,
      text: convert(html),
    };
    return getTransporter().sendMail(mailOptions);
  }
}
export default Email;
