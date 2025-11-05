package org.unestilodevida.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.unestilodevida.backend.model.Celula;

import java.util.List;
import java.util.Optional;

public interface CelulaRepository extends JpaRepository<Celula, Long> {
    @Query("SELECT c.nombre FROM Celula c WHERE c.lider.id = :id OR c.timoteo.id = :id")
    Optional<String> findNombreByUsuarioId(@Param("id") Integer id);

    @Query("SELECT c FROM Celula c WHERE c.fechaBaja IS NULL")
    List<Celula> findCelulasAlta();
}
