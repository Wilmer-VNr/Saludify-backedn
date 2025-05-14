import { sendMailToPaciente } from "../config/nodemailer.js"
import Paciente from "../models/Paciente.js"
import mongoose from "mongoose"
import { crearTokenJWT } from "../middlewares/JWT.js"

const loginPaciente = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const pacienteBDD = await Paciente.findOne({email})
    if(!pacienteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await pacienteBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = crearTokenJWT(pacienteBDD._id,pacienteBDD.rol)
	const {nombre,apellido,edad,direccion,telefono,_id} = pacienteBDD
	
    res.status(200).json({
        token,
        nombre,
        apellido,
        edad,
        direccion,
        telefono,
        _id,
        email:pacienteBDD.email
    })
}
const perfilPaciente = (req,res)=>{
    res.send("Perfil del paciente")
}
const listarPacientes = async (req,res)=>{
    const pacientes = await Paciente.find({status:true}).where('nutricionista').equals(req.nutricionistaBDD).select("-status -createdAt -updatedAt -__v").populate('nutricionista','_id nombre apellido')
    res.status(200).json(pacientes)
}
const detallePaciente = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el nutricionista ${id}`});
    const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v").populate('nutricionista','_id nombre apellido')
    res.status(200).json(paciente)
}
const registrarPaciente = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Paciente.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoPaciente = new Paciente(req.body)
    const password = Math.random().toString(36).slice(2)
    nuevoPaciente.password = await nuevoPaciente.encrypPassword("vet"+password)
    await sendMailToPaciente(email,"vet"+password)
    nuevoPaciente.nutricionista=req.nutricionistaBDD._id

    await nuevoPaciente.save()
    res.status(200).json({msg:"Registro exitoso del paciente y correo enviado"})

    

}
const actualizarPaciente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el paciente ${id}`});
    await Paciente.findByIdAndUpdate(req.params.id,req.body)
    res.status(200).json({msg:"Actualización exitosa del paciente"})
}
const eliminarPaciente = async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: `Lo sentimos, no existe el paciente con id ${id}` });
    }
    // Buscar al paciente
    const paciente = await Paciente.findById(id);
    if (!paciente) {
        return res.status(404).json({ msg: "Paciente no encontrado" });
    }
    // Verificar que el paciente pertenezca al nutricionista que hace la solicitud
    if (paciente.nutricionista.toString() !== req.nutricionistaBDD._id.toString()) {
        return res.status(403).json({ msg: "No tienes permisos para eliminar este paciente" });
    }
    // Eliminar el paciente de la base de datos
    await Paciente.findByIdAndDelete(id);

    res.status(200).json({ msg: "Paciente eliminado exitosamente" });
};



export {
		loginPaciente,
		perfilPaciente,
        listarPacientes,
        detallePaciente,
        registrarPaciente,
        actualizarPaciente,
        eliminarPaciente
}
