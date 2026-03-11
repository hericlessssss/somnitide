package dev.somnitide.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain entity representing a sleep session.
 * Pure Java — no Spring, no JPA annotations on the domain object.
 * JPA mapping lives in the infrastructure layer.
 */
public class SleepSession {
    public static final int MAX_SLEEP_HOURS = 14;

    private final String id;
    private final String userId;
    private final Instant startedAtUtc;
    private final Instant sleepStartEstimatedAtUtc;

    private Instant endedAtUtc;
    private Integer qualityRating; // 1..5, nullable
    private String note; // nullable
    private int earnedPoints;

    public SleepSession(
            String userId,
            Instant startedAtUtc,
            int sleepLatencyMinutes) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.startedAtUtc = startedAtUtc;
        this.sleepStartEstimatedAtUtc = startedAtUtc.plusSeconds(sleepLatencyMinutes * 60L);
    }

    /** Constructor for reconstituting from persistence. */
    public SleepSession(
            String id,
            String userId,
            Instant startedAtUtc,
            Instant sleepStartEstimatedAtUtc,
            Instant endedAtUtc,
            Integer qualityRating,
            String note,
            int earnedPoints) {
        this.id = id;
        this.userId = userId;
        this.startedAtUtc = startedAtUtc;
        this.sleepStartEstimatedAtUtc = sleepStartEstimatedAtUtc;
        this.endedAtUtc = endedAtUtc;
        this.qualityRating = qualityRating;
        this.note = note;
        this.earnedPoints = earnedPoints;
    }

    public boolean isOpen() {
        return endedAtUtc == null;
    }

    public void end(Instant endedAtUtc, Integer qualityRating, String note) {
        if (qualityRating != null && (qualityRating < 1 || qualityRating > 5)) {
            throw new IllegalArgumentException("Quality rating must be between 1 and 5");
        }
        this.endedAtUtc = endedAtUtc;
        this.qualityRating = qualityRating;
        this.note = note;
    }

    public boolean isStale(Instant now) {
        if (!isOpen())
            return false;
        return java.time.Duration.between(startedAtUtc, now).toHours() >= MAX_SLEEP_HOURS;
    }

    public boolean isValidDuration() {
        if (isOpen())
            return true;
        long hours = java.time.Duration.between(sleepStartEstimatedAtUtc, endedAtUtc).toHours();
        return hours < MAX_SLEEP_HOURS;
    }

    // ---- Getters ----

    public String getId() {
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

    public int getEarnedPoints() {
        return earnedPoints;
    }

    public void setEarnedPoints(int earnedPoints) {
        this.earnedPoints = earnedPoints;
    }
}
