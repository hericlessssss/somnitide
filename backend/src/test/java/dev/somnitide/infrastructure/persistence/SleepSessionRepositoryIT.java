package dev.somnitide.infrastructure.persistence;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for {@link SleepSessionRepository} (adapter + JPA + Flyway).
 */
@Tag("integration")
@Testcontainers(disabledWithoutDocker = true)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(dev.somnitide.infrastructure.persistence.adapter.SleepSessionRepositoryImpl.class)
class SleepSessionRepositoryIT {

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
    private SleepSessionRepository repository;

    // -----------------------------------------------------------------------
    // Happy path — save open session, find it
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: saved open session is found by findOpenByUserId")
    void happyPath_saveOpenSession_foundAsOpen() {
        Instant now = Instant.now();
        SleepSession session = new SleepSession("user-s-001", now, 14);

        repository.save(session);
        Optional<SleepSession> found = repository.findOpenByUserId("user-s-001");

        assertThat(found).isPresent();
        assertThat(found.get().getUserId()).isEqualTo("user-s-001");
        assertThat(found.get().getEndedAtUtc()).isNull();
        assertThat(found.get().isOpen()).isTrue();
    }

    // -----------------------------------------------------------------------
    // Edge case — closed session is not found as open
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: closed session is not returned by findOpenByUserId")
    void edgeCase_closedSession_notFoundAsOpen() {
        Instant now = Instant.now();
        SleepSession session = new SleepSession("user-s-002", now, 14);
        session.end(now.plusSeconds(3600), 4, null);
        repository.save(session);

        Optional<SleepSession> open = repository.findOpenByUserId("user-s-002");
        assertThat(open).isEmpty();
    }

    // -----------------------------------------------------------------------
    // findClosedByUserId — returns closed sessions ordered desc
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: findClosedByUserId returns closed sessions newest first")
    void findClosed_multipleClosedSessions_returnsNewestFirst() {
        Instant base = Instant.parse("2026-03-03T08:00:00Z");

        SleepSession s1 = new SleepSession("user-s-003", base, 14);
        s1.end(base.plusSeconds(6 * 3600), 5, "great");
        repository.save(s1);

        SleepSession s2 = new SleepSession("user-s-003", base.plusSeconds(86400), 14);
        s2.end(base.plusSeconds(86400 + 6 * 3600), 3, null);
        repository.save(s2);

        List<SleepSession> closed = repository.findClosedByUserId("user-s-003", 10);

        assertThat(closed).hasSize(2);
        // s2 started later, so it should appear first (newest-first ordering)
        assertThat(closed.get(0).getStartedAtUtc()).isAfterOrEqualTo(closed.get(1).getStartedAtUtc());
        assertThat(closed.get(0).getQualityRating()).isEqualTo(3);
        assertThat(closed.get(1).getQualityRating()).isEqualTo(5);
    }

    // -----------------------------------------------------------------------
    // Error / edge case — findOpenByUserId for unknown user returns empty
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("Integration: findOpenByUserId returns empty for user with no sessions")
    void edgeCase_noSessions_returnsEmpty() {
        Optional<SleepSession> open = repository.findOpenByUserId("user-nobody");
        assertThat(open).isEmpty();
    }
}
