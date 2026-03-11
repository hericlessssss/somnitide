package dev.somnitide.infrastructure.persistence.entity;

import dev.somnitide.domain.model.UserProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "user_profiles")
public class UserProfileEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "handle", unique = true)
    private String handle;

    @Column(name = "avatar_seed")
    private String avatarSeed;

    @Column(name = "total_score", nullable = false)
    private int totalScore;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    protected UserProfileEntity() {}

    public static UserProfileEntity fromDomain(UserProfile domain) {
        UserProfileEntity entity = new UserProfileEntity();
        entity.userId = domain.getUserId();
        entity.handle = domain.getHandle();
        entity.avatarSeed = domain.getAvatarSeed();
        entity.totalScore = domain.getTotalScore();
        entity.updatedAtUtc = domain.getUpdatedAtUtc();
        return entity;
    }

    public UserProfile toDomain() {
        return new UserProfile(
            userId,
            handle,
            avatarSeed,
            totalScore,
            updatedAtUtc
        );
    }

    public String getUserId() { return userId; }
    public String getHandle() { return handle; }
    public String getAvatarSeed() { return avatarSeed; }
    public int getTotalScore() { return totalScore; }
    public Instant getUpdatedAtUtc() { return updatedAtUtc; }
}
