const nodemailer= require("nodemailer");
const transporter= nodemailer.createTransport({
    host:process.env.SMTP_HOST ||"smtp.gmail.com",
    port:Number(process.env.SMTP_PORT)||465,
    secure:(Number(process.env.SMTP_PORT)||465)=== 465,
    auth:{user:process.env.SMTP_USER, pass:process.env.SMTP_PASS}

});
async function sendEmail({to,subject,text,html}){
    if(!to||!subject ||(!text && !html)){
        throw new Error("recepirnt subject and email are req");
    }
    if(!process.env.SMTP_USER|| !process.env.SMTP_PASS){
        throw new Error("smtp_user or pass is missing from env");
    }
    return transporter.sendMail({from:process.env.EMAIL_FROM || process.env.SMTP_USER,to,subject,text,html});

}
module.exports={sendEmail};