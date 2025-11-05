package org.unestilodevida.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;
@Data
public class CelulaDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "El día es obligatorio")
    private String dia; // LUNES, MARTES, etc.

    @NotNull(message = "El genero es obligatorio")
    private String genero; // LUNES, MARTES, etc.

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    private Double latitud;
    private Double longitud;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String descripcion;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    // Para enviar los usuarios asociados solo por su id
    @NotNull(message = "El líder es obligatorio")
    private Long liderId;

    private Long timoteoId;
}
