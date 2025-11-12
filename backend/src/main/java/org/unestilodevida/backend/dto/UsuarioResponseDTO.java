package org.unestilodevida.backend.dto;

import lombok.Data;

import java.util.Date;

@Data
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String fotoPerfil;
    private String rol;
    private Date fechaBaja;
}
