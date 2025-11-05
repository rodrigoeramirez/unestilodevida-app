package org.unestilodevida.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//Esto se va a utilizar para las respuestas, va a devolver el token.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    String token;
    String nombre;
    String apellido;
    String email;
    String rol;
    String fotoPerfil;
    Long id;

}
