import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegister = (userMail, token) => {

   
    let mailOptions = {
        from: "saludify@gmail.com", 
        to: userMail,
        subject: "Bienvenido a Saludify 🍎🏋️",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color:rgb(80, 165, 84);">¡Bienvenido a Saludify!</h2>
                <p>Estamos emocionados de que formes parte de nuestra comunidad de salud y bienestar.</p>
                <p>Para completar tu registro y comenzar a monitorear tu nutrición y actividad física, por favor confirma tu cuenta:</p>
                
                <a href="${process.env.URL_FRONTEND}confirmar/${token}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
                   Confirmar mi cuenta
                </a>
                
                <p>Con Saludify podrás:</p>
                <ul>
                    <li>Registrar y analizar tus hábitos alimenticios</li>
                    <li>Monitorear tu actividad física</li>
                    <li>Recibir recomendaciones personalizadas</li>
                    <li>Seguir tu progreso hacia tus metas de salud</li>
                </ul>
                
                <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
                
                <footer style="color: #666; font-size: 14px;">
                    <p>El equipo de Saludify</p>
                    <p>¡Juntos hacia una vida más saludable!</p>
                </footer>
            </div>
        `
    
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
        }
    })
}

const sendMailToRecoveryPassword = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'saludify@gmail.com',
    to: userMail,
    subject: "Restablece tu contraseña en Saludify 🍏",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2e7d32;">Saludify - Recuperación de contraseña</h1>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p>Por favor haz clic en el siguiente enlace para continuar:</p>
                    
            <a href="${process.env.URL_FRONTEND}recuperar-password/${token}" 
            style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Restablecer contraseña
            </a>
                    
            <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
                    
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    
            <footer style="color: #666; font-size: 14px;">
            <p>El equipo de Saludify</p>
            <p>¡Tu salud es nuestra prioridad!</p>
            </footer>
        </div>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
    
}


const sendMailToPaciente = async(userMail, password) => {
    let info = await transporter.sendMail({
        from: 'saludify@gmail.com',
        to: userMail,
        subject: "Bienvenido a Saludify - Credenciales de acceso 🍏",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #2e7d32; text-align: center;">
                    <span style="font-size: 24px;">🍎 Saludify 🏋️</span>
                </h1>
                <hr style="border: 0; height: 2px; background: linear-gradient(to right, #2e7d32, #81c784); margin: 20px 0;">
                
                <p style="font-size: 16px;">¡Bienvenido como profesional de Saludify!</p>
                <p>Estamos encantados de que formes parte de nuestra plataforma de salud y bienestar.</p>
                
                <div style="background-color: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin-bottom: 10px; color: #2e7d32; font-weight: bold;">Tus credenciales de acceso:</p>
                    <p><strong>Correo electrónico:</strong> ${userMail}</p>
                    <p><strong>Contraseña temporal:</strong> ${password}</p>
                </div>
                
                                
                <p style="font-size: 14px; color: #666;">Por seguridad, te recomendamos cambiar tu contraseña después del primer acceso.</p>
                
                <hr style="border: 0; height: 2px; background: linear-gradient(to right, #2e7d32, #81c784); margin: 20px 0;">
                
                <footer style="text-align: center; color: #666; font-size: 14px;">
                    <p>El equipo de Saludify</p>
                    <p>¡Juntos hacia una vida más saludable!</p>
                </footer>
            </div>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToPaciente
}

