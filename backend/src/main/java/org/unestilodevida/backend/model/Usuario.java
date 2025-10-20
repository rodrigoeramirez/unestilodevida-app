package org.unestilodevida.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // marca la clase como tabla de base de dato
@Table(name="usuario")
@Data // Genera getters, setters, toString, equals y hashCode automáticamente
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    // clave primaria autoincremental
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(unique=true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String clave;

    @Column(nullable = true)
    private String telefono;

    @Column(nullable = true)
    private String fotoPerfil; //Hibernate convierte el nombre del atributo fotoPerfil en foto_perfil → separa palabras en camelCase con guión bajo (snake_case).

    @Enumerated(EnumType.STRING) // guarda el rol como texto en la DB
    @Column(nullable = false)
    private Rol rol;

    public enum Rol {
        ADMIN, LIDER, TIMOTEO
    }
}
