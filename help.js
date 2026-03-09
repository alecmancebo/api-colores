import bcrypt from 'bcrypt';

const hashEnElEnv = "$2b$10$vV/hR4d9jnpnkvSxvJPIQu8z3Digu/TOuNhKk7id.tz.kSzzOp.Hu"; // Tu hash del .env
const palabraQueYoCreo = "alec"; // Reemplaza esto

bcrypt.compare(palabraQueYoCreo, hashEnElEnv).then(resultado => {
    if(resultado) {
        console.log("¡Coinciden! Esa es la contraseña correcta.");
    } else {
        console.log("No coinciden. El hash no pertenece a esa palabra.");
    }
});