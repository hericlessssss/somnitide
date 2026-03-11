package dev.somnitide.domain.model;

import java.time.Instant;

/**
 * Domain entity representing a user's public profile.
 */
public class UserProfile {
    private final String userId;
    private String handle;
    private String avatarSeed;
    private int totalScore;
    private Instant updatedAtUtc;

    public UserProfile(String userId, String handle, String avatarSeed, int totalScore, Instant updatedAtUtc) {
        this.userId = userId;
        this.handle = handle;
        this.avatarSeed = avatarSeed;
        this.totalScore = totalScore;
        this.updatedAtUtc = updatedAtUtc;
    }

    public static UserProfile createNew(String userId, String handle) {
        return new UserProfile(
            userId,
            handle,
            userId, // Use userId as default avatar seed
            0,
            Instant.now()
        );
    }

    public void updateHandle(String newHandle) {
        if (newHandle != null && !newHandle.startsWith("@")) {
            throw new IllegalArgumentException("Handle must start with @");
        }
        this.handle = newHandle;
        this.updatedAtUtc = Instant.now();
    }

    public void addScore(int points) {
        if (points < 0) return;
        this.totalScore += points;
        this.updatedAtUtc = Instant.now();
    }

    public void syncScore(int totalScore) {
        this.totalScore = Math.max(0, totalScore);
        this.updatedAtUtc = Instant.now();
    }

    // ---- Getters ----

    public String getUserId() {
        return userId;
    }

    public String getHandle() {
        return handle;
    }

    public String getAvatarSeed() {
        return avatarSeed;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public Instant getUpdatedAtUtc() {
        return updatedAtUtc;
    }
}
