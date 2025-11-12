package org.unestilodevida.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.unestilodevida.backend.dto.ClaveUpdateDTO;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.dto.UsuarioResponseDTO;
import org.unestilodevida.backend.dto.UsuarioUpdateDTO;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.service.UsuarioService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/updateClave/{id}")
    public ResponseEntity<?> updateClave(
            @PathVariable Long id,
            @RequestBody ClaveUpdateDTO datos) {

        return usuarioService.updateClave(id, datos);
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

    @GetMapping ("/{id}")
    public Optional<UsuarioResponseDTO> getUsuarioById(@PathVariable Long id) {return usuarioService.getUsuarioById(id);}

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

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUsuario(
            @PathVariable Long id,
            @RequestPart("usuarioDTO") String usuarioJson,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();
        UsuarioUpdateDTO usuarioDTO = mapper.readValue(usuarioJson, UsuarioUpdateDTO.class);

        Optional<UsuarioResponseDTO> actualizado = usuarioService.updateUsuario(id, usuarioDTO, foto);
        if (actualizado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(actualizado.get());
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUsuario (@PathVariable Long id) {
        return usuarioService.deleteUsuario(id);
    }
}
