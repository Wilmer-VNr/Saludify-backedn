import mongoose, {Schema, model} from 'mongoose'
import bcrypt from "bcryptjs"


const pacienteSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    apellido:{
        type:String,
        require:true,
        trim:true
    },
    edad:{
        type:String,
        require:true,
        trim:true
    },
    direccion:{
        type:String,
        trim:true,
        default:null
    },
    telefono:{
        type:String,
        trim:true,
        default:null
    },
    
    email:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    },

    rol:{
        type:String,
        default:"paciente"
    },
    nutricionista: {
        type: Schema.Types.ObjectId,
        ref: 'Nutricionista',
        required: true
    }

},{
    timestamps:true
})


// Método para cifrar el password del paciente
pacienteSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}


// Método para verificar si el password ingresado es el mismo de la BDD
pacienteSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}



export default model('Paciente',pacienteSchema)