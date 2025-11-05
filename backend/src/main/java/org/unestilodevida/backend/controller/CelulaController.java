package org.unestilodevida.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.unestilodevida.backend.dto.CelulaDTO;
import org.unestilodevida.backend.dto.CelulaResponseDTO;
import org.unestilodevida.backend.model.Celula;
import org.unestilodevida.backend.service.CelulaService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/celulas")
public class CelulaController {
    private CelulaService celulaService;

    public CelulaController(CelulaService celulaService) {
        this.celulaService = celulaService;
    }

    @PostMapping("/create")
    public Celula createCelula(@Valid @RequestBody CelulaDTO celulaDTO) {
        // @Valid hace que si alguna regla no se cumpla del DTO, Spring lanze automáticamente MethodArgumentNotValidException antes de llamar al servicio.
        return celulaService.createCelula(celulaDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCelula (@PathVariable Long id) {
        return celulaService.deleteCelula(id);
    }

    @PatchMapping("/update/{id}")
    public Celula updateCelula (@Valid @RequestBody CelulaDTO celulaDTO, @PathVariable Long id) {
        return celulaService.updateCelula(celulaDTO, id);
    }

    @GetMapping
    public List<CelulaResponseDTO> getCelulas () {
        return celulaService.getCelulas();
    }

    @GetMapping ("/dias")
    public List<Map<String, String>> getDias() { return celulaService.getDias(); }

    @GetMapping ("/generos")
    public List<Map<String, String>> getGeneros() { return celulaService.getGeneros(); }

    // Consulta si el usuario está libre o asocaido a una celula
    @GetMapping("/usuarioLibre/{id}")
    public Optional<String> usuarioLibre (@PathVariable Integer id) {
        return celulaService.usuarioLibre(id); // Si no está asociado a ninguna celula retorna NULL, sino retorna el nombre de la celula asociada para mostrar en el frontend
    }
}
