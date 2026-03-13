package dev.somnitide.application.port;

import dev.somnitide.domain.model.UserProfile;
import java.util.List;
import java.util.Optional;

public interface UserProfileRepository {
    UserProfile save(UserProfile profile);
    Optional<UserProfile> findByUserId(String userId);
    Optional<UserProfile> findByHandle(String handle);
    List<UserProfile> findTop100ByScore();
    long countUsersWithScoreAbove(int score);
}
