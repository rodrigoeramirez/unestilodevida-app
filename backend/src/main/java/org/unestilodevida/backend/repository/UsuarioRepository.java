package org.unestilodevida.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.unestilodevida.backend.model.Usuario;

import java.util.Optional;

// Extiende JpaRepository → te da todos los métodos CRUD (save, findById, delete, etc.)
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail (String email); // metodo custom para buscar por email, porque jpa los basicos.
}
