import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";

const urlmongo = process.env.MONGO_URL;

import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]); //PREGUNTAR

function conectar(){
    return MongoClient.connect(urlmongo);
}

export function leerColores(){
    return new Promise((resolve, reject) => {
            
            let conexion = null;

            conectar()
            .then( objconexion => {
                conexion = objconexion; //guardo la conexion para luego cerrarla, cambio nombre y luego digo que una es igual a otra (al principio no son la misma)
                
                let coleccion = conexion.db("colores").collection("colores");
                
                return coleccion.find().toArray(); //obtengo todos los colores almacenados en la coleccion en array, retorna promesa
            })

            .then(colores => {

                resolve(colores);
            })

            .catch ((error) => {
                 console.error("Error en leerColores:", error);
                reject({ error: "Error en ddbb" });
                
            }
            )
            
            .finally(() => {
                if (conexion){ //que cierre la conexion solo si se ha abierto
                    conexion.close();
                }
            });
        });
}

/*leerColores()
    .then(colores => console.log(colores))
    .catch(error => console.error(error)); */

//si algo fallta en la conexion, en los dos then. 

export function crearColor(objColor){

    return new Promise((resolve, reject) => {
        let conexion = null;    
        conectar()
        .then( objconexion => {
            conexion = objconexion; //guardo la conexion para luego cerrarla, cambio nombre y luego digo que una es igual a otra (al principio no son la misma)
            let coleccion = conexion.db("colores").collection("colores");
            return coleccion.insertOne(objColor); //insertOne retorna una promesa
        })

        .then(({ insertedId }) => resolve(insertedId)) //si la insercion es correcta, resuelvo la promesa con el id del nuevo color insertado, que es lo que me devuelve insertOne

        .catch(() => reject({ error: "Error en ddbb" }))

        .finally(() => {
            if (conexion){ //que cierre la conexion solo si se ha abierto
                conexion.close();
            }
        });
    })
};

export function borrarColor(id){
    return new Promise((resolve, reject) => {
        let conexion = null;
        conectar()
        .then( objconexion => {
            
            conexion = objconexion;
            
            let coleccion = conexion.db("colores").collection("colores");

            return coleccion.deleteOne({_id: new ObjectId(id)}); //elimino el color con el id especificado, deleteOne retorna una promesa
        })

        .then(({ deletedCount }) => resolve(deletedCount))

        .catch(() => reject({ error: "Error en ddbb" }))
        
        .finally(() => {
            if (conexion){ 
                conexion.close();
            }
        });
    })
}

export function actualizarColor(id, objColor){ //objColor puede ser cualquier combinacion de rgb o solo uno
    return new Promise((resolve, reject) => {
        let conexion = null;
        conectar()
        .then( objconexion => {

            conexion = objconexion;

            let coleccion = conexion.db("colores").collection("colores");
            
            return coleccion.updateOne({_id: new ObjectId(id)}, {$set: objColor}); //actualizo el color con el id especificado, updateOne retorna una promesa
        }
        )
        .then(({matchedCount, modifiedCount}) => resolve(
            { matchedCount, modifiedCount }
        )) //resuelvo la promesa con info de coincidencia y modificación

        .catch(() => reject({ error: "Error en ddbb" }))

        .finally(() => {
            if (conexion){ 
                conexion.close();
            }
        });
    })
}
