package org.unestilodevida.backend.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class CelulaResponseDTO {
    private Long id;
    private String nombre;
    private String dia;
    private String genero;
    private LocalTime horaInicio;
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String descripcion;
    private String telefono;
    private String enlaceWhatsapp;
    private String qrWhatsapp;

    private UsuarioResponseDTO lider;
    private UsuarioResponseDTO timoteo;
}
