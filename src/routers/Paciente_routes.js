import {Router} from 'express'
const router = Router()


import {
    actualizarPaciente,
    detallePaciente,
    eliminarPaciente,
    listarPacientes,
    registrarPaciente,
    loginPaciente,
    perfilPaciente 
} from "../controllers/Paciente_controller.js";
import { verificarTokenJWT } from '../middlewares/JWT.js';



router.post('/paciente/login',loginPaciente)
router.get('/paciente/perfil',verificarTokenJWT,perfilPaciente)
router.get('/pacientes',verificarTokenJWT,listarPacientes)
router.get('/detalle-paciente/:id',verificarTokenJWT,detallePaciente)
router.post('/paciente/registro',verificarTokenJWT,verificarTokenJWT,registrarPaciente)
router.put('/paciente/actualizar/:id',verificarTokenJWT,actualizarPaciente)
router.delete('/eliminar-paciente/:id',verificarTokenJWT,eliminarPaciente)


export default router