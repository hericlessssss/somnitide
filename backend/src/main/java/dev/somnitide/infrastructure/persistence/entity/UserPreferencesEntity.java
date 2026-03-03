package dev.somnitide.infrastructure.persistence.entity;

import dev.somnitide.domain.model.UserPreferences;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * JPA entity mapping for the {@code user_preferences} table.
 * Lives exclusively in the infrastructure layer.
 * Domain objects never reference this class directly.
 */
@Entity
@Table(name = "user_preferences")
public class UserPreferencesEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "sleep_latency_min", nullable = false)
    private int sleepLatencyMinutes;

    @Column(name = "cycle_length_min", nullable = false)
    private int cycleLengthMinutes;

    @Column(name = "min_cycles", nullable = false)
    private int minCycles;

    @Column(name = "max_cycles", nullable = false)
    private int maxCycles;

    @Column(name = "buffer_min", nullable = false)
    private int bufferMinutes;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    // ---- JPA requires no-arg constructor ----
    protected UserPreferencesEntity() {
    }

    // ---- Factory ----

    public static UserPreferencesEntity fromDomain(UserPreferences domain) {
        UserPreferencesEntity entity = new UserPreferencesEntity();
        entity.userId = domain.userId();
        entity.sleepLatencyMinutes = domain.sleepLatencyMinutes();
        entity.cycleLengthMinutes = domain.cycleLengthMinutes();
        entity.minCycles = domain.minCycles();
        entity.maxCycles = domain.maxCycles();
        entity.bufferMinutes = domain.bufferMinutes();
        entity.updatedAtUtc = domain.updatedAtUtc();
        return entity;
    }

    // ---- Mapping to domain ----

    public UserPreferences toDomain() {
        return new UserPreferences(
                userId,
                sleepLatencyMinutes,
                cycleLengthMinutes,
                minCycles,
                maxCycles,
                bufferMinutes,
                updatedAtUtc);
    }

    // ---- Getters ----

    public String getUserId() {
        return userId;
    }

    public int getSleepLatencyMinutes() {
        return sleepLatencyMinutes;
    }

    public int getCycleLengthMinutes() {
        return cycleLengthMinutes;
    }

    public int getMinCycles() {
        return minCycles;
    }

    public int getMaxCycles() {
        return maxCycles;
    }

    public int getBufferMinutes() {
        return bufferMinutes;
    }

    public Instant getUpdatedAtUtc() {
        return updatedAtUtc;
    }
}
