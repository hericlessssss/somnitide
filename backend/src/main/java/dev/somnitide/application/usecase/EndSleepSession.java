package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.service.SleepProgressCalculator;
import dev.somnitide.domain.service.StreakCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class EndSleepSession {

    private final SleepSessionRepository repository;
    private final UserPreferencesRepository preferencesRepository;
    private final UserProfileRepository profileRepository;
    private final SleepProgressCalculator progressCalculator;
    private final StreakCalculator streakCalculator;

    public EndSleepSession(SleepSessionRepository repository,
                           UserPreferencesRepository preferencesRepository,
                           UserProfileRepository profileRepository,
                           SleepProgressCalculator progressCalculator,
                           StreakCalculator streakCalculator) {
        this.repository = repository;
        this.preferencesRepository = preferencesRepository;
        this.profileRepository = profileRepository;
        this.progressCalculator = progressCalculator;
        this.streakCalculator = streakCalculator;
    }

    public record Request(Integer qualityRating, String note) {
    }

    /**
     * Ends the user's currently open session.
     * Throws if no session is open.
     */
    @Transactional
    public SleepSession execute(String userId, Request request) {
        SleepSession session = repository.findOpenByUserId(userId)
                .orElseThrow(() -> new DomainException("NO_OPEN_SESSION",
                        "User has no open sleep session to end"));

        Instant now = Instant.now();
        session.end(now, request.qualityRating(), request.note());

        // Get user preferences for cycle length
        dev.somnitide.domain.model.UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElse(dev.somnitide.domain.model.UserPreferences.defaults(userId));

        // Calculate points only if duration is valid AND minimum duration (1 cycle) is met
        if (session.isValidDuration() && session.isMinimumDurationMet(preferences.cycleLengthMinutes())) {
            int sleepMinutes = getSleepMinutes(session);
            
            // Get streak for bonus
            java.time.Instant thirtyDaysAgo = now.minus(java.time.Duration.ofDays(30));
            java.util.List<SleepSession> sessions = repository.findByUserIdAndEndedAtAfter(userId, thirtyDaysAgo);
            java.util.List<java.time.LocalDate> sortedDates = sessions.stream()
                    .filter(s -> s.getEndedAtUtc() != null && s.isValidDuration())
                    .map(s -> java.time.LocalDate.ofInstant(s.getEndedAtUtc(), java.time.ZoneOffset.UTC))
                    .distinct()
                    .sorted(java.util.Comparator.reverseOrder())
                    .toList();
            
            int streak = streakCalculator.calculateStreak(sortedDates);
            int points = progressCalculator.computeTotal(sleepMinutes, session.getQualityRating(), streak);
            
            session.setEarnedPoints(points);

            // Update profile
            profileRepository.findByUserId(userId).ifPresent(profile -> {
                profile.addScore(points);
                profileRepository.save(profile);
            });
        }

        return repository.save(session);
    }

    private int getSleepMinutes(SleepSession session) {
        if (session.getEndedAtUtc() == null) return 0;
        long minutes = java.time.Duration.between(session.getSleepStartEstimatedAtUtc(), session.getEndedAtUtc()).toMinutes();
        return (int) Math.max(0, minutes);
    }
}
