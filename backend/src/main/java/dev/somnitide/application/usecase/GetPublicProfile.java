package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GetPublicProfile {

    private final UserProfileRepository repository;
    private final SleepSessionRepository sessionRepository;
    private final GetProgress getProgress;

    public GetPublicProfile(UserProfileRepository repository, 
                          SleepSessionRepository sessionRepository,
                          GetProgress getProgress) {
        this.repository = repository;
        this.sessionRepository = sessionRepository;
        this.getProgress = getProgress;
    }

    @Transactional(readOnly = true)
    public record PublicProfileWithRank(
        UserProfile profile, 
        Integer rankPosition,
        Integer lastSleepMinutes,
        Double avgScore,
        Integer streakDays
    ) {}

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

        // Get actual stats for last 30 days to be more representative
        GetProgress.Response progress = getProgress.execute(profile.getUserId(), 30);
        
        // Get the ABSOLUTE last session for "Última Noite", regardless of the 30-day window
        List<SleepSession> lastSessions = sessionRepository.findClosedByUserId(profile.getUserId(), 1);
        Integer lastSleep = null;
        if (!lastSessions.isEmpty()) {
            SleepSession s = lastSessions.get(0);
            if (s.getEndedAtUtc() != null && s.getSleepStartEstimatedAtUtc() != null) {
                long minutes = java.time.Duration.between(s.getSleepStartEstimatedAtUtc(), s.getEndedAtUtc()).toMinutes();
                lastSleep = (int) Math.max(0, minutes);
            }
        }
        
        return Optional.of(new PublicProfileWithRank(
            profile, 
            rankPosition, 
            lastSleep, 
            progress.avgScore(), 
            progress.streakDays()
        ));
    }
}
