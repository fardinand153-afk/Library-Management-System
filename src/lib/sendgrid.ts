import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    if (process.env.NODE_ENV === 'development' && process.env.SENDGRID_API_KEY === 'mock-sendgrid-key') {
        console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        await sgMail.send({
            to,
            from: 'noreply@library.com', // Change to your verified sender
            subject,
            text,
            html: html || text,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
