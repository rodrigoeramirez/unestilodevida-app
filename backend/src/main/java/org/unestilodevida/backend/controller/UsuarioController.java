package org.unestilodevida.backend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/create")
    public Usuario crearUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        // @Valid hace que si alguna regla no se cumpla del DTO, Spring lanze automáticamente MethodArgumentNotValidException antes de llamar al servicio.
        return usuarioService.crearUsuario(usuarioDTO);
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }
}
