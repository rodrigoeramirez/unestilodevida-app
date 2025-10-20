package org.unestilodevida.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Clase para manejar excepciones de forma global en toda la aplicación.
 * @ControllerAdvice permite interceptar errores lanzados por cualquier controlador
 * y definir cómo se deben convertir en respuestas HTTP para el cliente.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja los errores de validación de los DTOs.
     *
     * @param ex La excepción lanzada cuando un DTO con @Valid no cumple las reglas
     * @return ResponseEntity con código HTTP 400 y un mapa con los mensajes de error
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        // Mapa donde se guardarán los errores por campo
        Map<String, String> errores = new HashMap<>();

        // Recorre todos los errores de validación y los agrega al mapa
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errores.put(error.getField(), error.getDefaultMessage())
        );

        // Retorna HTTP 400 (Bad Request) con los mensajes de error en el body
        return ResponseEntity.badRequest().body(errores);
    }

    /**
     * Maneja la excepción personalizada UsuarioYaExisteException.
     * Esta excepción se lanza cuando se intenta crear un usuario con un email duplicado.
     *
     * @param e La excepción lanzada desde el servicio
     * @return ResponseEntity con código HTTP 409 y mensaje de error
     */
    @ExceptionHandler(UsuarioYaExisteException.class)
    public ResponseEntity<String> handleUsuarioYaExiste(UsuarioYaExisteException e) {
        // Retorna HTTP 409 (Conflict) con el mensaje de la excepción
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
}
