package org.unestilodevida.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.unestilodevida.backend.auth.AuthResponse;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.dto.UsuarioResponseDTO;
import org.unestilodevida.backend.exception.UsuarioYaExisteException;
import org.unestilodevida.backend.jwt.JwtService;
import org.unestilodevida.backend.model.Celula;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.repository.CelulaRepository;
import org.unestilodevida.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final CelulaRepository celulaRepository;
    @Autowired
    private HttpServletRequest request;
    @Autowired
    JwtService jwtService;// Se encarga de crear el token cuando el usuario se crea con exito.
    @Autowired
    PasswordEncoder passwordEncoder;

    public UsuarioService (UsuarioRepository usuarioRepository, CelulaRepository celulaRepository) {
        this.usuarioRepository=usuarioRepository;
        this.celulaRepository=celulaRepository;
    }

    public AuthResponse createUsuario(UsuarioDTO usuarioDTO, MultipartFile foto) {

        // Hago esta validación acá porque no se puede hacer mediante anotaciones, es necesario consultar la BD.
        if (usuarioRepository.findByEmail(usuarioDTO.getEmail()).isPresent()) {
            throw new UsuarioYaExisteException("El email ya se encuentra registrado en la BD");
        }
            // Mapear DTO a entidad
            Usuario usuario = new Usuario();
            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setApellido(usuarioDTO.getApellido());
            usuario.setEmail(usuarioDTO.getEmail());
            usuario.setTelefono(usuarioDTO.getTelefono());
            // Encriptar la clave antes de guardarla
            String encryptedPassword = passwordEncoder.encode(usuarioDTO.getClave());
            usuario.setClave(encryptedPassword); // Usamos la clave encriptada
            usuario.setRol(Usuario.Rol.valueOf(usuarioDTO.getRol().toUpperCase()));

            // Si se envio foto de perfil, entonces...
            if (foto != null && !foto.isEmpty()) {
                String tipo = foto.getContentType();
                if (tipo == null || !tipo.startsWith("image/")) {
                    throw new IllegalArgumentException("El archivo debe ser una imagen válida");
                }
                String carpeta = "usuarios_fotos_perfil/";
                File directorio = new File(carpeta);
                // Si no existe crea la carpeta
                if (!directorio.exists()) {
                    directorio.mkdirs();
                }

                String nombreArchivo = UUID.randomUUID() + "_" + foto.getOriginalFilename().replaceAll(" ", "_");
                Path ruta = Paths.get(carpeta + nombreArchivo);
                try {
                    Files.copy(foto.getInputStream(), ruta, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }

                usuario.setFotoPerfil(nombreArchivo);
            }

            // Guardar en la base de datos
             usuarioRepository.save(usuario);
        return  AuthResponse.builder()
                .token(jwtService.getToken(usuario))
                .build();
    }

    public List<UsuarioResponseDTO> getUsuarios() {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()+"/usuarios_fotos_perfil/";

        return usuarioRepository.findAll().stream()
                .map(u -> {
                    UsuarioResponseDTO dto = new UsuarioResponseDTO();
                    dto.setId(u.getId());
                    dto.setNombre(u.getNombre());
                    dto.setApellido(u.getApellido());
                    dto.setEmail(u.getEmail());
                    dto.setTelefono(u.getTelefono());
                    dto.setRol(u.getRol().toString());

                    if (u.getFotoPerfil() != null) {
                        dto.setFotoPerfil(baseUrl + u.getFotoPerfil());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String,String>> getRoles() {
        return Arrays.stream(Usuario.Rol.values())
                .map(rol -> Map.of(
                        "nombre", rol.name()
                ))
                .toList();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public List<Usuario> getLideres() {
        return usuarioRepository.findByRol(Usuario.Rol.LIDER);
    }

    public List<Usuario> getTimoteos() {
        return usuarioRepository.findByRol(Usuario.Rol.TIMOTEO);
    }

    @Transactional
    public ResponseEntity<String> deleteUsuario(Long id) {
        Usuario usuarioBaja = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Célula no encontrada con ID: " + id));
        Optional<String> nombreCelula=celulaRepository.findNombreByUsuarioId(Math.toIntExact(id));
        // Si está asignado a una célula, no permitir baja
        if (nombreCelula!= null) {
            return ResponseEntity.badRequest()
                    .body("El usuario no puede ser eliminado porque está asignado a la célula: "
                            + nombreCelula
                            + ". Primero debe quitarse de esa célula antes de realizar la baja.");
        }
        // Si no está asignado, realizar baja lógica
        usuarioBaja.setFechaBaja(new Date());
        usuarioRepository.save(usuarioBaja);

        return ResponseEntity.ok("Usuario dado de baja con éxito.");
    }
}
