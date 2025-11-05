package org.unestilodevida.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.dto.UsuarioResponseDTO;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.service.UsuarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createUsuario(@Valid @RequestPart("usuarioDTO") String usuarioJson, @RequestPart(value="foto", required = false)MultipartFile foto) throws JsonProcessingException {
        // @Valid hace que si alguna regla no se cumpla del DTO, Spring lanze automáticamente MethodArgumentNotValidException antes de llamar al servicio.
        // Convertimos el JSON a DTO
        ObjectMapper mapper = new ObjectMapper();
        UsuarioDTO usuarioDTO = mapper.readValue(usuarioJson, UsuarioDTO.class);

        usuarioService.createUsuario(usuarioDTO, foto);
        return ResponseEntity.ok("Usuario creado con éxito");
    }

    @GetMapping
    public List<UsuarioResponseDTO> getUsuarios() {
        return usuarioService.getUsuarios();
    }

    @GetMapping ("/roles")
    public List<Map<String, String>> getRoles() { return usuarioService.getRoles(); }

    @GetMapping("/existByEmail/{email}")
    public boolean existByEmail (@PathVariable String email) {
        return usuarioService.buscarPorEmail(email).isPresent(); // Retorna true si ya existe y false si no existe
    }

    @GetMapping ("/lideres")
    public  List<Usuario> getLideres() {
        return usuarioService.getLideres();
    }

    @GetMapping("/timoteos")
    public List<Usuario> getTimoteos() {
        return  usuarioService.getTimoteos();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCelula (@PathVariable Long id) {
        return usuarioService.deleteUsuario(id);
    }
}
