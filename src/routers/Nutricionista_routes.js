import {Router} from 'express'
import { actualizarPassword, actualizarPerfil, comprobarTokenPasword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from '../controllers/Nutricionista_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()

//Rutas para recuperar contraseña

router.post('/registro', registro);
router.get('/confirmar/:token',confirmarMail)
router.post('/recuperar-password',recuperarPassword)
router.get('/recuperar-password/:token',comprobarTokenPasword)
router.post('/nuevo-password/:token',crearNuevoPassword)

//Ruta para iniciar sesion
router.post('/login',login)
// Ruta para ver perfil del paciente
router.get('/perfil',verificarTokenJWT,perfil)
router.put('/nutricionista/:id',verificarTokenJWT,actualizarPerfil)
router.put('/nutricionista/actualizar-password/:id',verificarTokenJWT,actualizarPassword)
export default router