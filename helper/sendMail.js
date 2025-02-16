import nodemailer from 'nodemailer';

export const sendMail = async (email, htmlTemplate) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use true for port 465
        auth: {
            user: "atiqur.mdrahaman@gmail.com",
            pass: "sjdx vorp jndm jdvm" // Ensure to use an app password, not your Gmail account password
        }
    });



    const info = await transporter.sendMail({
        from: "atiqur.mdrahaman@gmail.com",
        to: email || "developer110.fzeetechz@gmail.com",
        subject: "Player Testing",
        html: htmlTemplate // Include the HTML template
    });

    console.log("Message sent: %s", info.messageId);
};
