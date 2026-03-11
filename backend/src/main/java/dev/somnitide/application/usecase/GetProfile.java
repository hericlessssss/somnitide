package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GetProfile {

    private final UserProfileRepository repository;
    private final dev.somnitide.application.port.SleepSessionRepository sessionRepository;
    private final dev.somnitide.domain.service.SleepProgressCalculator calculator;

    public GetProfile(UserProfileRepository repository, 
                      dev.somnitide.application.port.SleepSessionRepository sessionRepository,
                      dev.somnitide.domain.service.SleepProgressCalculator calculator) {
        this.repository = repository;
        this.sessionRepository = sessionRepository;
        this.calculator = calculator;
    }

    @Transactional
    public Optional<UserProfile> execute(String userId) {
        Optional<UserProfile> profileOpt = repository.findByUserId(userId);
        
        if (profileOpt.isEmpty()) {
            return profileOpt;
        }

        UserProfile profile = profileOpt.get();
        List<dev.somnitide.domain.model.SleepSession> sessions = sessionRepository.findByUserId(userId);
        
        // Backfill points for sessions and calculate total in memory
        int computedTotal = 0;

        for (dev.somnitide.domain.model.SleepSession session : sessions) {
            if (session.getEarnedPoints() == 0 && session.isValidDuration()) {
                int sleepMinutes = getSleepMinutes(session);
                // Use 0 streak for historical backfill
                int points = calculator.computeTotal(sleepMinutes, session.getQualityRating(), 0);
                if (points > 0) {
                    session.setEarnedPoints(points);
                    sessionRepository.save(session);
                }
            }
            computedTotal += session.getEarnedPoints();
        }

        // Recalculate total score and sync profile if different
        if (computedTotal != profile.getTotalScore()) {
            profile.syncScore(computedTotal);
            return Optional.of(repository.save(profile));
        }
        
        return Optional.of(profile);
    }

    private int getSleepMinutes(dev.somnitide.domain.model.SleepSession session) {
        if (session.getEndedAtUtc() == null) return 0;
        long minutes = java.time.Duration.between(session.getSleepStartEstimatedAtUtc(), session.getEndedAtUtc()).toMinutes();
        return (int) Math.max(0, minutes);
    }
}
