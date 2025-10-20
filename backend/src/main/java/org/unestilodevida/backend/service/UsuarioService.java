package org.unestilodevida.backend.service;

import org.springframework.stereotype.Service;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.exception.UsuarioYaExisteException;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService (UsuarioRepository usuarioRepository) {
        this.usuarioRepository=usuarioRepository;
    }

    public Usuario crearUsuario(UsuarioDTO usuarioDTO) {

        // Hago esta validación acá porque no se puede hacer mediante anotaciones, es necesario consultar la BD.
        if (usuarioRepository.findByEmail(usuarioDTO.getEmail()).isPresent()) {
                throw  new UsuarioYaExisteException("El email ya se encuentra registrado en la BD");
            }

            // Mapear DTO a entidad
            Usuario usuario = new Usuario();
            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setApellido(usuarioDTO.getApellido());
            usuario.setEmail(usuarioDTO.getEmail());
            usuario.setClave(usuarioDTO.getClave());
            usuario.setRol(Usuario.Rol.valueOf(usuarioDTO.getRol().toUpperCase()));

            // Guardar en la base de datos
            return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}
