package dev.somnitide.infrastructure.persistence.adapter;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import dev.somnitide.infrastructure.persistence.entity.UserProfileEntity;
import dev.somnitide.infrastructure.persistence.jpa.UserProfileJpaRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class UserProfileRepositoryImpl implements UserProfileRepository {

    private final UserProfileJpaRepository jpaRepository;

    public UserProfileRepositoryImpl(UserProfileJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public UserProfile save(UserProfile profile) {
        UserProfileEntity entity = UserProfileEntity.fromDomain(profile);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<UserProfile> findByUserId(String userId) {
        return jpaRepository.findById(userId).map(UserProfileEntity::toDomain);
    }

    @Override
    public Optional<UserProfile> findByHandle(String handle) {
        return jpaRepository.findByHandle(handle).map(UserProfileEntity::toDomain);
    }

    @Override
    public List<UserProfile> findTop100ByScore() {
        return jpaRepository.findTop100ByOrderByTotalScoreDesc().stream()
                .map(UserProfileEntity::toDomain)
                .collect(Collectors.toList());
    }
}
