package org.unestilodevida.backend.jwt;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.unestilodevida.backend.service.UsuarioDetailsService;

/*
Esto es un filtro personalizado que intercepta las solicitudes HTTP para procesar el JWT. Este filtro se usa
generalmente para autenticar a los usuarios en función del token JWT que se incluye en el
encabezado de la solicitud.*/

// Basicamente lo que hace es verificar si la request tiene el token:
// * Si no lo tiene devuelve un ERROR 403.
// * Si lo tiene, extrae el username del token (JwtService) y luego en el UsuarioEmpresaDetailsService lo busca en la base de datos y chequea que el token este bien.
@RequiredArgsConstructor
@Component
// indica que esta clase es parte de la configuración de Spring y debe ser gestionada por el contenedor de Spring.
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;

    // OncePerRequestFilter es una clase de Spring que garantiza que el filtro solo se ejecute una vez por solicitud. Esto es útil cuando tienes filtros que necesitas aplicar a todas las solicitudes.

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,@NonNull FilterChain filterChain) throws ServletException, IOException {
        // Este es el metodo principal que se ejecuta cuando la solicitud llega al filtro. Aquí es donde se realiza la lógica para verificar el token JWT y autenticarlo.
        final String token = getTokenFromRequest(request);
        final String email;

        if (token == null) {
            filterChain.doFilter(request,response); // Le duevuelvo el control a la cadena de Filtros, para permitir que la solicitud continúe su curso, sin realizar ninguna acción de autenticación (es decir, no se realiza ninguna autenticación en este caso).
            return;
        }
        email=jwtService.getEmailFromToken(token);
        if(email!=null && SecurityContextHolder.getContext().getAuthentication()==null){
            UserDetails userDetails= usuarioDetailsService.loadUserByUsername(email);
            if(jwtService.isTokenValid(token, userDetails)){
                UsernamePasswordAuthenticationToken authToken= new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);            }
        }
        filterChain.doFilter(request,response);

    }

    private String getTokenFromRequest(HttpServletRequest request) {
        final String authHeader= request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ") ){
            return authHeader.substring(7);
        }
        return null;
    }
}
