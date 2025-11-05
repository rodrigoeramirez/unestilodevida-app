package org.unestilodevida.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.unestilodevida.backend.dto.UsuarioDTO;
import org.unestilodevida.backend.service.UsuarioService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        // Uso ResponseEntity para personalizar la respuesta, pero tengo que devolver el token en realidad.
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestPart("usuarioDTO") String usuarioJson,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            UsuarioDTO request = mapper.readValue(usuarioJson, UsuarioDTO.class);
            return ResponseEntity.ok(usuarioService.createUsuario(request, foto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); // o devolver un mensaje de error más claro
        }
    }

}

