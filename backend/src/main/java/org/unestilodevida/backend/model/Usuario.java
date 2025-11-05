package org.unestilodevida.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;

@Entity // marca la clase como tabla de base de dato
@Table(name="usuario")
@Data // Genera getters, setters, toString, equals y hashCode automáticamente
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {
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

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaBaja;

    @Column(nullable = true)
    private String fotoPerfil; //Hibernate convierte el nombre del atributo fotoPerfil en foto_perfil → separa palabras en camelCase con guión bajo (snake_case).

    @Enumerated(EnumType.STRING) // guarda el rol como texto en la DB
    @Column(nullable = false)
    private Rol rol;

    public enum Rol {
        ADMIN, LIDER, TIMOTEO
    }

    // Métodos requeridos por UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Si deseas manejar roles, puedes retornar una lista de roles desde aquí.
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return clave; // Retorna la clave del usuario
    }

    @Override
    public String getUsername() {
        return email; // Retorna el nombre de usuario
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Define si la cuenta está expirada
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Define si la cuenta está bloqueada
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Define si las credenciales están expiradas
    }

}
