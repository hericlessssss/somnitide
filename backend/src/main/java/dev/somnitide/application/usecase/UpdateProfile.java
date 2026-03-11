package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UpdateProfile {

    private final UserProfileRepository repository;
    private final dev.somnitide.application.port.SleepSessionRepository sessionRepository;
    private final dev.somnitide.domain.service.SleepProgressCalculator calculator;

    public UpdateProfile(UserProfileRepository repository, 
                         dev.somnitide.application.port.SleepSessionRepository sessionRepository,
                         dev.somnitide.domain.service.SleepProgressCalculator calculator) {
        this.repository = repository;
        this.sessionRepository = sessionRepository;
        this.calculator = calculator;
    }

    public record Request(String handle) {}

    @Transactional
    public UserProfile execute(String userId, Request request) {
        String handle = request.handle();
        
        if (handle != null && !handle.startsWith("@")) {
            handle = "@" + handle;
        }

        if (handle != null) {
            repository.findByHandle(handle).ifPresent(p -> {
                if (!p.getUserId().equals(userId)) {
                    throw new DomainException("HANDLE_ALREADY_TAKEN", "Este @ já está em uso.");
                }
            });
        }

        final String finalHandle = handle;
        UserProfile profile = repository.findByUserId(userId)
                .orElseGet(() -> UserProfile.createNew(userId, finalHandle));

        // Backfill points for all sessions that have 0 but are valid and compute total
        int computedTotal = 0;
        java.util.List<dev.somnitide.domain.model.SleepSession> sessions = sessionRepository.findByUserId(userId);
        for (dev.somnitide.domain.model.SleepSession session : sessions) {
            if (session.getEarnedPoints() == 0 && session.isValidDuration()) {
                int sleepMinutes = getSleepMinutes(session);
                int points = calculator.computeTotal(sleepMinutes, session.getQualityRating(), 0);
                if (points > 0) {
                    session.setEarnedPoints(points);
                    sessionRepository.save(session);
                }
            }
            computedTotal += session.getEarnedPoints();
        }

        // Sync total score
        if (computedTotal != profile.getTotalScore()) {
            profile.syncScore(computedTotal);
        }

        profile.updateHandle(finalHandle);
        return repository.save(profile);
    }

    private int getSleepMinutes(dev.somnitide.domain.model.SleepSession session) {
        if (session.getEndedAtUtc() == null) return 0;
        long minutes = java.time.Duration.between(session.getSleepStartEstimatedAtUtc(), session.getEndedAtUtc()).toMinutes();
        return (int) Math.max(0, minutes);
    }
}
