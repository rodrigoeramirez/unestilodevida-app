package org.unestilodevida.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioDTO {

    // Las anotaciones son para validar en el backend, antes de que se haga cualquier operación con la base de datos.

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío")
    private String apellido;

    @NotBlank(message = "El telefono no puede estar vacío")
    private String telefono;

    @Email(message = "Debe ser un email válido")
    private String email;

    @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
    private String clave;

    private String rol;

}
