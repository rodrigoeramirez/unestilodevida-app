package org.unestilodevida.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.unestilodevida.backend.dto.CelulaDTO;
import org.unestilodevida.backend.dto.CelulaResponseDTO;
import org.unestilodevida.backend.dto.UsuarioResponseDTO;
import org.unestilodevida.backend.model.Celula;
import org.unestilodevida.backend.model.Usuario;
import org.unestilodevida.backend.repository.CelulaRepository;
import org.unestilodevida.backend.repository.UsuarioRepository;
import org.unestilodevida.backend.util.QRUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CelulaService {
    private final CelulaRepository celulaRepository;
    private final UsuarioRepository usuarioRepository;
    @Autowired
    private HttpServletRequest request;

    public CelulaService(CelulaRepository celulaRepository, UsuarioRepository usuarioRepository) {
        this.celulaRepository=celulaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Celula createCelula(CelulaDTO celulaDTO) {
        // Mapear celulaDto a Celula
        Celula celula = new Celula();
        celula.setNombre(celulaDTO.getNombre());
        celula.setDia(Celula.DiaSemana.valueOf(celulaDTO.getDia().toUpperCase()));
        celula.setGenero(Celula.Genero.valueOf(celulaDTO.getGenero().toUpperCase()));
        celula.setHoraInicio(celulaDTO.getHoraInicio());
        celula.setDireccion(celulaDTO.getDireccion());
        celula.setLatitud(celulaDTO.getLatitud());
        celula.setLongitud(celulaDTO.getLongitud());
        celula.setDescripcion(celulaDTO.getDescripcion());
        celula.setTelefono(celulaDTO.getTelefono());

        // Buscar y asignar el líder
        if (celulaDTO.getLiderId() != null) {
            Usuario lider = usuarioRepository.findById(celulaDTO.getLiderId())
                    .orElseThrow(() -> new RuntimeException("Líder no encontrado"));
            celula.setLider(lider);
        }

        // Buscar y asignar el timoteo (puede ser null)
        if (celulaDTO.getTimoteoId() != 0) {
            Usuario timoteo = usuarioRepository.findById(celulaDTO.getTimoteoId())
                    .orElseThrow(() -> new RuntimeException("Timoteo no encontrado"));
            celula.setTimoteo(timoteo);
        }

        // Generar enlace de WhatsApp
        try {
            String mensaje = "Hola, quiero unirme a la célula";
            String telefono = celulaDTO.getTelefono().replaceAll("[^0-9]", ""); // eliminar espacios o símbolos
            String enlaceWhatsapp = "https://wa.me/" + telefono + "?text=" + URLEncoder.encode(mensaje, StandardCharsets.UTF_8.toString());
            celula.setEnlaceWhatsapp(enlaceWhatsapp);

            // Generar QR en Base64
            String qrBase64 = QRUtils.generarQRBase64(enlaceWhatsapp, 200, 200);
            celula.setQrWhatsapp(qrBase64);
        } catch (Exception e) {
            // Manejar errores de generación de QR
            System.err.println("Error generando enlace o QR de WhatsApp: " + e.getMessage());
            celula.setEnlaceWhatsapp(null);
            celula.setQrWhatsapp(null);
        }

        return celulaRepository.save(celula);
    }

    public Celula updateCelula(CelulaDTO celulaDTO, Long id) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/usuarios_fotos_perfil/";
        Celula celulaExistente = celulaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Célula no encontrada con ID: " + id));

        if (celulaDTO.getNombre() != null)
            celulaExistente.setNombre(celulaDTO.getNombre());

        if (celulaDTO.getDescripcion() != null)
            celulaExistente.setDescripcion(celulaDTO.getDescripcion());

        if (celulaDTO.getGenero() != null)
            celulaExistente.setGenero(Celula.Genero.valueOf(celulaDTO.getGenero().toUpperCase()));

        if (celulaDTO.getDia() != null)
            celulaExistente.setDia(Celula.DiaSemana.valueOf(celulaDTO.getDia().toUpperCase()));

        if (celulaDTO.getHoraInicio() != null)
            celulaExistente.setHoraInicio(celulaDTO.getHoraInicio());

        if (celulaDTO.getDireccion() != null)
            celulaExistente.setDireccion(celulaDTO.getDireccion());

        if (celulaDTO.getLatitud() != null)
            celulaExistente.setLatitud(celulaDTO.getLatitud());

        if (celulaDTO.getLongitud() != null)
            celulaExistente.setLongitud(celulaDTO.getLongitud());

        if (celulaDTO.getTelefono() != null) {
            celulaExistente.setTelefono(celulaDTO.getTelefono());

            try {
                String mensaje = "Hola, quiero unirme a la célula";
                String telefono = celulaDTO.getTelefono().replaceAll("[^0-9]", "");
                String enlaceWhatsapp = "https://wa.me/" + telefono + "?text=" + URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
                celulaExistente.setEnlaceWhatsapp(enlaceWhatsapp);

                String qrBase64 = QRUtils.generarQRBase64(enlaceWhatsapp, 200, 200);
                celulaExistente.setQrWhatsapp(qrBase64);
            } catch (Exception e) {
                System.err.println("Error generando enlace o QR de WhatsApp: " + e.getMessage());
                celulaExistente.setEnlaceWhatsapp(null);
                celulaExistente.setQrWhatsapp(null);
            }
        }

        if (celulaDTO.getLiderId() != null) {
            Usuario nuevoLider = usuarioRepository.findById(celulaDTO.getLiderId())
                    .orElseThrow(() -> new RuntimeException("Líder no encontrado con ID: " + celulaDTO.getLiderId()));
            celulaExistente.setLider(nuevoLider);
        }

        if (celulaDTO.getTimoteoId() != 0) {
            Usuario nuevoTimoteo = usuarioRepository.findById(celulaDTO.getTimoteoId())
                    .orElseThrow(() -> new RuntimeException("Timoteo no encontrado con ID: " + celulaDTO.getTimoteoId()));
            celulaExistente.setTimoteo(nuevoTimoteo);
        }

        Celula actualizada = celulaRepository.save(celulaExistente);

        // ✅ Asegurar que las URLs de fotos sean absolutas
        if (actualizada.getLider() != null && actualizada.getLider().getFotoPerfil() != null) {
            String foto = actualizada.getLider().getFotoPerfil();
            if (!foto.startsWith("http")) { // evita duplicar si ya tiene la URL completa
                actualizada.getLider().setFotoPerfil(baseUrl + foto);
            }
        }

        if (actualizada.getTimoteo() != null && actualizada.getTimoteo().getFotoPerfil() != null) {
            String foto = actualizada.getTimoteo().getFotoPerfil();
            if (!foto.startsWith("http")) {
                actualizada.getTimoteo().setFotoPerfil(baseUrl + foto);
            }
        }

        return actualizada;
    }

    @Transactional
    public List<CelulaResponseDTO> getCelulas () {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/usuarios_fotos_perfil/";

        return celulaRepository.findCelulasAlta().stream().map(celula -> {
            CelulaResponseDTO dto = new CelulaResponseDTO();
            dto.setId(celula.getId());
            dto.setNombre(celula.getNombre());
            dto.setDia(celula.getDia().toString()); // si es enum
            dto.setGenero(celula.getGenero().toString()); // si es enum
            dto.setHoraInicio(celula.getHoraInicio()); // LocalTime
            dto.setDireccion(celula.getDireccion());
            dto.setLatitud(celula.getLatitud());
            dto.setLongitud(celula.getLongitud());
            dto.setDescripcion(celula.getDescripcion());
            dto.setTelefono(celula.getTelefono());
            dto.setEnlaceWhatsapp(celula.getEnlaceWhatsapp());
            dto.setQrWhatsapp(celula.getQrWhatsapp());

            // Lider
            if (celula.getLider() != null) {
                UsuarioResponseDTO liderDTO = new UsuarioResponseDTO();
                liderDTO.setId(celula.getLider().getId());
                liderDTO.setNombre(celula.getLider().getNombre());
                liderDTO.setApellido(celula.getLider().getApellido());
                liderDTO.setEmail(celula.getLider().getEmail());
                liderDTO.setTelefono(celula.getLider().getTelefono());
                liderDTO.setRol(celula.getLider().getRol().toString());
                if (celula.getLider().getFotoPerfil() != null) {
                    liderDTO.setFotoPerfil(baseUrl + celula.getLider().getFotoPerfil());
                }
                dto.setLider(liderDTO);
            }

            // Timoteo
            if (celula.getTimoteo() != null) {
                UsuarioResponseDTO timoteoDTO = new UsuarioResponseDTO();
                timoteoDTO.setId(celula.getTimoteo().getId());
                timoteoDTO.setNombre(celula.getTimoteo().getNombre());
                timoteoDTO.setApellido(celula.getTimoteo().getApellido());
                timoteoDTO.setEmail(celula.getTimoteo().getEmail());
                timoteoDTO.setTelefono(celula.getTimoteo().getTelefono());
                timoteoDTO.setRol(celula.getTimoteo().getRol().toString());
                if (celula.getTimoteo().getFotoPerfil() != null) {
                    timoteoDTO.setFotoPerfil(baseUrl + celula.getTimoteo().getFotoPerfil());
                }
                dto.setTimoteo(timoteoDTO);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public List<Map<String,String>> getDias() {
        return Arrays.stream(Celula.DiaSemana.values())
                .map(dia -> Map.of(
                        "nombre", dia.name()
                ))
                .toList();
    }

    public List<Map<String,String>> getGeneros() {
        return Arrays.stream(Celula.Genero.values())
                .map(genero -> Map.of(
                        "nombre", genero.name()
                ))
                .toList();
    }

    public Optional<String> usuarioLibre(Integer id) {
        return celulaRepository.findNombreByUsuarioId(id); // Busca una celula asociada al id del usuario y retorna el nombre de la misma.
    }

    @Transactional
    public ResponseEntity<String> deleteCelula(Long id) {
        Celula celulaBaja = celulaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Célula no encontrada con ID: " + id));
        celulaBaja.setFechaBaja(new Date());
        celulaBaja.setLider(null);
        celulaBaja.setTimoteo(null);
        celulaRepository.save(celulaBaja);
        return ResponseEntity.ok("Celula eliminada con exito.");
    }

}
