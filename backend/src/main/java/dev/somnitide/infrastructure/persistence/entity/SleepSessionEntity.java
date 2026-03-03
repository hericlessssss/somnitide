package dev.somnitide.infrastructure.persistence.entity;

import dev.somnitide.domain.model.SleepSession;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity mapping for the {@code sleep_sessions} table.
 * Lives exclusively in the infrastructure layer.
 */
@Entity
@Table(name = "sleep_sessions")
public class SleepSessionEntity {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "started_at_utc", nullable = false)
    private Instant startedAtUtc;

    @Column(name = "sleep_start_estimated_at_utc", nullable = false)
    private Instant sleepStartEstimatedAtUtc;

    @Column(name = "ended_at_utc")
    private Instant endedAtUtc;

    @Column(name = "quality_rating")
    private Integer qualityRating;

    @Column(name = "note")
    private String note;

    // ---- JPA requires no-arg constructor ----
    protected SleepSessionEntity() {
    }

    // ---- Factory ----

    public static SleepSessionEntity fromDomain(SleepSession domain) {
        SleepSessionEntity entity = new SleepSessionEntity();
        entity.id = UUID.fromString(domain.getId());
        entity.userId = domain.getUserId();
        entity.startedAtUtc = domain.getStartedAtUtc();
        entity.sleepStartEstimatedAtUtc = domain.getSleepStartEstimatedAtUtc();
        entity.endedAtUtc = domain.getEndedAtUtc();
        entity.qualityRating = domain.getQualityRating();
        entity.note = domain.getNote();
        return entity;
    }

    // ---- Mapping to domain ----

    public SleepSession toDomain() {
        return new SleepSession(
                id.toString(),
                userId,
                startedAtUtc,
                sleepStartEstimatedAtUtc,
                endedAtUtc,
                qualityRating,
                note);
    }

    // ---- Getters ----

    public UUID getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Instant getStartedAtUtc() {
        return startedAtUtc;
    }

    public Instant getSleepStartEstimatedAtUtc() {
        return sleepStartEstimatedAtUtc;
    }

    public Instant getEndedAtUtc() {
        return endedAtUtc;
    }

    public Integer getQualityRating() {
        return qualityRating;
    }

    public String getNote() {
        return note;
    }
}
