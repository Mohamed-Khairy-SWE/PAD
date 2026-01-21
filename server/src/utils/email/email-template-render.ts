import pug from "pug";
import path from "path";

export const renderEmailTemplate = (type: string, templateData: object) => {
  let emailTemplateName = "welcome.pug";
  switch (type) {
    case "welcome":
      emailTemplateName = "welcome.pug";
      break;
    case "forget-password":
      emailTemplateName = "forget-password.pug";
      break;
    case "reset-password":
      emailTemplateName = "reset-password.pug";
      break;
    case "signup-verification":
      emailTemplateName = "signup-verification.pug";
      break;
    case "newsletter_confirmation":
      emailTemplateName = "newsletter-confirmation.pug";
      break;
    case "contact_form":
      emailTemplateName = "contact-form.pug";
      break;
    case "ticket_notification":
      emailTemplateName = "ticket-notification.pug";
      break;
    case "related_user_notification":
      emailTemplateName = "related-user-notification.pug";
      break;

  }
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    emailTemplateName
  );
  const html = pug.renderFile(templatePath, templateData);
  return html;
};
