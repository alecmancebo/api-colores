import dotenv from "dotenv";
dotenv.config();

import express from 'express';
const servidor = express();
import {leerColores, crearColor, borrarColor, actualizarColor} from './db.js';
import cors from "cors";


servidor.use(cors()); //convierte la API EN pública, cualquier persona podria hacer peticiones

servidor.use(express.json()); //En tu código: Solo tienes un GET que envía datos al cliente. No tienes endpoints que reciban datos JSON en el body. Por eso no es necesaria en este caso. Sí la necesitarías si tuvieras POST/PUT/DELETE que reciban datos JSON. Crea peticion.body.

//servidor.use(express.static("./front")); //para servir archivos estaticos, como el index.html, que se encuentra en la carpeta pruebas.

servidor.get("/colores", async (peticion, respuesta) => { //get mejor usar .get en vez de use
    try {
        /*let conexion = await MongoClient.connect(urlmongo);
        let coleccion = conexion.db("colores").collection("colores");
        let colores = await coleccion.find().toArray(); //obtengo todos los colores almacenados en la coleccion en array

        conexion.close();*/

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
        siguiente(); //si no se encuentra el color, se llama a siguiente para que se ejecute el middleware de manejo de rutas no encontradas (404)

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

        //if (modifiedCount){
        //    return respuesta.sendStatus(204); //si se encuentra el color y se modificó
        //} 
        //if (matchedCount) {
        //    return respuesta.status(200).json({ 
        //    message: "No se modificaron los datos porque son iguales a los existentes" });
        //}

        siguiente(); //si no se encuentra el color, se llama a siguiente para que se ejecute el middleware de manejo de rutas no encontradas (404)

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



/*quiero hacer una peticion con el metodo patch a actualizar/:id, y en la peticion enviar un objeto con cualquier combinacion de propiedades del color r, g y b, por ejemplo {r: 255}, y quiero que se actualice solo la propiedad r del color con el id especificado, sin modificar las otras propiedades g y b. 

Si logre actualizar en color será 204, si hubo error será 500, y si no hay color que actualizar, 404. Si intento actualizar con los mismos valores, debo enviar un 200 junto a un objeto explicando lo que ha ocurrido*/