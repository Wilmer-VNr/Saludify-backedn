
import Nutricionista from "../models/Nutricionista.js"
import {sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import mongoose from "mongoose"


// const registro = async (req, res) => {
//     const { email, password } = req.body;
//     // Verifica que no haya campos vacíos
//     if (Object.values(req.body).includes("")) {
//         return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
//     }
//     // Verifica si ya existe un usuario registrado
//     const totalNutricionista = await Nutricionista.countDocuments();
//     if (totalNutricionista > 0) {
//         return res.status(400).json({ msg: "Lo sentimos, ya existe un usuario registrado" });
//     }
//     // Verifica si el email ya está registrado (por redundancia, aunque solo habrá un usuario)
//     const verificarEmailBDD = await Nutricionista.findOne({ email });
//     if (verificarEmailBDD) {
//         return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
//     }
//     // Crear nuevo usuario
//     const nuevoNutricionista = new Nutricionista(req.body);
//     nuevoNutricionista.password = await nuevoNutricionista.encrypPassword(password);
//     // Generar token y enviar correo
//     const token = nuevoNutricionista.crearToken();
//     await sendMailToRegister(email, token);
//     // Guardar en BDD
//     await nuevoNutricionista.save();
//     res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" });
// };

const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Nutricionista.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoNutricionista = new Nutricionista(req.body)
    nuevoNutricionista.password = await nuevoNutricionista.encrypPassword(password)
    const token = nuevoNutricionista.crearToken()
    await sendMailToRegister(email,token)
    await nuevoNutricionista.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}

const confirmarMail = async (req,res)=>{
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const nutricionistaBDD = await Nutricionista.findOne({token:req.params.token})
    if(!nutricionistaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    nutricionistaBDD.token = null
    nutricionistaBDD.confirmEmail=true
    await nutricionistaBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}


const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const nutricionistaBDD = await Nutricionista.findOne({email})
    if(!nutricionistaBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = nutricionistaBDD.crearToken()
    nutricionistaBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await nutricionistaBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const nutricionistaBDD = await Nutricionista.findOne({token:req.params.token})
    if(nutricionistaBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await nutricionistaBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const crearNuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const nutricionistaBDD = await Nutricionista.findOne({token:req.params.token})
    if(nutricionistaBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    nutricionistaBDD.token = null
    nutricionistaBDD.password = await nutricionistaBDD.encrypPassword(password)
    await nutricionistaBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const login = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const nutricionistaBDD = await Nutricionista.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(nutricionistaBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!nutricionistaBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await nutricionistaBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
	const {nombre,apellido,edad,direccion,telefono,_id} = nutricionistaBDD
	const token = crearTokenJWT(nutricionistaBDD._id,nutricionistaBDD.rol)
    res.status(200).json({
        token,
        nombre,
        apellido,
        edad,
        direccion,
        telefono,
        _id,
        email:nutricionistaBDD.email
    })
}

const perfil =(req,res)=>{
    delete req.nutricionistaBDD.token
    delete req.nutricionistaBDD.confirmEmail
    delete req.nutricionistaBDD.createdAt
    delete req.nutricionistaBDD.updatedAt
    delete req.nutricionistaBDD.__v
    res.status(200).json(req.nutricionistaBDD)
}


const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    const {nombre,apellido,edad,direccion,telefono,email} = req.body
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const nutricionistaBDD = await Nutricionista.findById(id)
    if(!nutricionistaBDD) return res.status(404).json({msg:`Lo sentimos, no existe el Nutricionista ${id}`})
    if (nutricionistaBDD.email != email)
    {
        const nutricionistaBDDMail = await Nutricionista.findOne({email})
        if (nutricionistaBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
    nutricionistaBDD.nombre = nombre ?? nutricionistaBDD.nombre
    nutricionistaBDD.apellido = apellido ?? nutricionistaBDD.apellido
    nutricionistaBDD.edad = edad ?? nutricionistaBDD.edad
    nutricionistaBDD.direccion = direccion ?? nutricionistaBDD.direccion
    nutricionistaBDD.telefono = telefono ?? nutricionistaBDD.telefono
    nutricionistaBDD.email = email ?? nutricionistaBDD.email
    await nutricionistaBDD.save()
    console.log(nutricionistaBDD)
    res.status(200).json(nutricionistaBDD)
}

const actualizarPassword = async (req,res)=>{
    const nutricionistaBDD = await Nutricionista.findById(req.nutricionistaBDD._id)
    if(!nutricionistaBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await nutricionistaBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    nutricionistaBDD.password = await nutricionistaBDD.encrypPassword(req.body.passwordnuevo)
    await nutricionistaBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword
}


