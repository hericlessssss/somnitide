package dev.somnitide.infrastructure.persistence.jpa;

import dev.somnitide.infrastructure.persistence.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserProfileJpaRepository extends JpaRepository<UserProfileEntity, String> {
    Optional<UserProfileEntity> findByHandle(String handle);
    List<UserProfileEntity> findTop100ByOrderByTotalScoreDesc();
    long countByTotalScoreGreaterThan(int score);
}
