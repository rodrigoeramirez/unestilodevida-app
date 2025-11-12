package org.unestilodevida.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;

@Data
public class UsuarioUpdateDTO {

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío")
    private String apellido;

    @NotBlank(message = "El teléfono no puede estar vacío")
    private String telefono;

    @Email(message = "Debe ser un email válido")
    private String email;

    private String rol; // Puede ser null si no lo modificás

    private Date fechaBaja;
}
