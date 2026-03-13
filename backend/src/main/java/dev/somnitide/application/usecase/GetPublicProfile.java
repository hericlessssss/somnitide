package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class GetPublicProfile {

    private final UserProfileRepository repository;

    public GetPublicProfile(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public record PublicProfileWithRank(UserProfile profile, Integer rankPosition) {}

    @Transactional(readOnly = true)
    public Optional<PublicProfileWithRank> execute(String handle) {
        if (!handle.startsWith("@")) {
            handle = "@" + handle;
        }
        Optional<UserProfile> profileOpt = repository.findByHandle(handle);
        if (profileOpt.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = profileOpt.get();
        long usersAbove = repository.countUsersWithScoreAbove(profile.getTotalScore());
        int rankPosition = (int) (usersAbove + 1);

        return Optional.of(new PublicProfileWithRank(profile, rankPosition));
    }
}
