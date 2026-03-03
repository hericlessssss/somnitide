package dev.somnitide.infrastructure.persistence;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.model.UserPreferences;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for {@link UserPreferencesRepository} (adapter + JPA +
 * Flyway).
 * Uses a real PostgreSQL container via Testcontainers.
 * Tag: "integration" — may be skipped on CI without Docker.
 */
@Tag("integration")
@Testcontainers(disabledWithoutDocker = true)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(dev.somnitide.infrastructure.persistence.adapter.UserPreferencesRepositoryImpl.class)
class UserPreferencesRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("somnitide_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    private UserPreferencesRepository repository;

    // -----------------------------------------------------------------------
    // Happy path — save then find
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: save then findByUserId returns saved preferences")
    void happyPath_saveAndFind_returnsPreferences() {
        UserPreferences prefs = UserPreferences.defaults("user-it-001");

        repository.save(prefs);
        Optional<UserPreferences> found = repository.findByUserId("user-it-001");

        assertThat(found).isPresent();
        assertThat(found.get().userId()).isEqualTo("user-it-001");
        assertThat(found.get().sleepLatencyMinutes()).isEqualTo(14);
        assertThat(found.get().cycleLengthMinutes()).isEqualTo(90);
        assertThat(found.get().minCycles()).isEqualTo(4);
        assertThat(found.get().maxCycles()).isEqualTo(6);
        assertThat(found.get().bufferMinutes()).isEqualTo(5);
    }

    // -----------------------------------------------------------------------
    // Edge case — unknown user
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: findByUserId returns empty for unknown userId")
    void edgeCase_unknownUser_returnsEmpty() {
        Optional<UserPreferences> found = repository.findByUserId("user-nonexistent");

        assertThat(found).isEmpty();
    }

    // -----------------------------------------------------------------------
    // Upsert — saving again updates, not duplicates
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: saving again for same userId updates the record")
    void upsert_secondSave_updatesRecord() {
        UserPreferences original = UserPreferences.defaults("user-it-002");
        repository.save(original);

        UserPreferences updated = new UserPreferences(
                "user-it-002",
                20, // changed latency
                100, // changed cycle
                3,
                5,
                10,
                Instant.now());
        repository.save(updated);

        Optional<UserPreferences> found = repository.findByUserId("user-it-002");
        assertThat(found).isPresent();
        assertThat(found.get().sleepLatencyMinutes()).isEqualTo(20);
        assertThat(found.get().cycleLengthMinutes()).isEqualTo(100);
        assertThat(found.get().bufferMinutes()).isEqualTo(10);
    }
}
