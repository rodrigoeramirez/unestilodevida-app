package org.unestilodevida.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.unestilodevida.backend.jwt.JwtService;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.repository.UsuarioRepository;
import org.unestilodevida.backend.service.UsuarioDetailsService;
import org.unestilodevida.backend.service.UsuarioService;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;
    @Autowired
    private HttpServletRequest req;


    public AuthResponse login(LoginRequest request) {
        String baseUrl = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort()+"/usuarios_fotos_perfil/";
        try {
            // 1️⃣ Buscar usuario por email
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o clave incorrectos"));

            // 2️⃣ Verificar si está dado de baja
            if (usuario.getFechaBaja() != null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario ha sido dado de baja");
            }

            // Intenta autenticar al usuario
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getClave())
            );

            // Si la autenticación es exitosa, genera el token
            UserDetails userDetails = usuarioDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtService.getToken((Usuario) userDetails);

            return AuthResponse.builder()
                    .token(token)
                    .id(((Usuario) userDetails).getId())
                    .nombre(((Usuario) userDetails).getNombre())
                    .apellido(((Usuario) userDetails).getApellido())
                    .email(((Usuario) userDetails).getEmail())
                    .rol(((Usuario) userDetails).getRol().toString())
                    .fotoPerfil(((Usuario) userDetails).getFotoPerfil() != null ? baseUrl+((Usuario) userDetails).getFotoPerfil() : null)
                    .build();

        } catch (BadCredentialsException e) {
            // Si la autenticación falla por usuario o clave incorrectos
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o clave incorrectos");
        } catch (Exception e) {
            // Si ocurre algún otro error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en el servidor: " + e.getMessage());
        }
    }

}
