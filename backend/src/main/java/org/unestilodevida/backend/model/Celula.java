package org.unestilodevida.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.Date;

@Entity // marca la clase como tabla de base de dato
@Table(name="celula")
@Data // Genera getters, setters, toString, equals y hashCode automáticamente
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Celula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiaSemana dia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genero genero;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private String direccion;

    private Double latitud;
    private Double longitud;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private String telefono;

    private String enlaceWhatsapp;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String qrWhatsapp;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaBaja;

    @OneToOne
    @JoinColumn(name = "lider_id", unique = true, nullable = true)
    private Usuario lider;

    @OneToOne
    @JoinColumn(name = "timoteo_id", unique = true, nullable = true)
    private Usuario timoteo; // puede ser null

    public enum DiaSemana {
        LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
    }

    public enum Genero {
        HOMBRE, MUJER
    }
}
