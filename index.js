import dotenv from "dotenv";
dotenv.config();
import express from 'express';
const servidor = express();
import {leerColores, crearColor, borrarColor, actualizarColor} from './db.js';
import cors from "cors";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const saltRounds = 10;

let nombre = process.env.NOMBRE;
let password = process.env.PASSWORD;

servidor.use(cors()); 

servidor.use(express.json()); 
function verificar (peticion,respuesta,siguiente){

      let token = peticion.headers.authorization.split(" ")[1]; //aqui se recibe el token, que se manda en las cabeceras de la petición, y se puede verificar si es correcto o no, para dar acceso o no a la ruta cerrada

    if(token){
        try {
            jwt.verify(token, "ayuda", (err, usuario) => {
                if (err) return respuesta.status(403).json({ error: "Token inválido" });
                peticion.usuario = usuario;
                siguiente();
            });
        } catch (err) {
            respuesta.status(403).json({ error: "Token inválido o expirado." });
        }
    }else{
        respuesta.status(403).json({ error: "Token inválido o expirado." });
    }
}


servidor.post("/login", async (peticion,respuesta) => {  
    const {password, nombre} = peticion.body;

    try{
        // Comparamos con los datos del .env
        if (nombre === process.env.NOMBRE) {
            // Comparamos lo que escribió el usuario con el HASH del .env
            const coincide = await bcrypt.compare(password, process.env.HASH_PASSWORD);

            if (coincide) {
                const token = jwt.sign({ usuario: nombre }, "ayuda");
                return respuesta.json({ token });
            }
        }else{
        respuesta.status(401).json({ error: "Credenciales incorrectas" });}
    }
   catch{
    respuesta.status(500).json({ error: "Error en el servidor" });
   }
});

servidor.use(verificar); 

servidor.get("/colores", async (peticion, respuesta) => { 
    try {

        let colores =  await leerColores();
       
        respuesta.json(colores); //envio el array de colores como respuesta en formato json
        
    } catch (e) {
       respuesta.status(500);
       respuesta.json({ error: "Error al leer los datos" });
    }
});

servidor.post("/nuevo", async (peticion, respuesta) => {
    try {
        let id = await crearColor(peticion.body); //creo el nuevo color en la base de datos
        respuesta.json({id}); //envio el resultado de la inserción como respuesta en formato json 

    } catch (e) {
        respuesta.status(500);
        respuesta.json({ error: "Error al crear el color" });
    }
});

servidor.delete("/borrar/:id", async (peticion, respuesta, siguiente) => {
    try {
        let cantidad = await borrarColor( peticion.params.id); //elimino el color de la base de datos
        if (cantidad) {
            return respuesta.sendStatus(204); //si se encuentra el color
        }
        siguiente(); 

    } catch (e) {
        respuesta.status(500);
        respuesta.json({ error: "Error al eliminar el color" });
    }
});

servidor.patch("/actualizar/:id", async (peticion, respuesta, siguiente) => {
    try {
        let {matchedCount, modifiedCount} = await actualizarColor( peticion.params.id, peticion.body); //actualizo el color de la base de datos, peticion.body contiene los datos a actualizar

        if (matchedCount) {
            if (modifiedCount) {
                return respuesta.sendStatus(204); //si se encuentra el color y se modificó
            } else {
                return respuesta.status(200).json({ 
                mensaje: "No se modificaron los datos porque son iguales a los existentes" });
            }
        }


        siguiente(); 

    } catch (e) {
        respuesta.status(500);
        respuesta.json({ error: "Error al actualizar el color" });
    }
});

servidor.use((error,peticion,respuesta,siguiente) => { //middleware de manejo de errores, se ejecuta si ocurre un error en las rutas anteriores
     respuesta.status(400); //bad request
     respuesta.json({ error: "Error en la petición" });
});

servidor.use((peticion,respuesta) => { //middleware de manejo de rutas no encontradas, se ejecuta si no se encuentra ninguna ruta que coincida con la petición
    respuesta.status(404);  //not found
    respuesta.json({ error: "Recurso no encontrado" });
});

servidor.listen(process.env.PORT);