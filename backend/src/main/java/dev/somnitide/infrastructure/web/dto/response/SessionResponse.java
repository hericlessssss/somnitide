package dev.somnitide.infrastructure.web.dto.response;

import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.WakeSuggestion;

import java.time.Instant;
import java.util.List;

public record SessionResponse(
        String id,
        Instant startedAtUtc,
        Instant sleepStartEstimatedAtUtc,
        Instant endedAtUtc,
        boolean isOpen,
        Integer qualityRating,
        String note,
        List<WakeSuggestion> suggestions) {
    public static SessionResponse fromDomain(SleepSession session, List<WakeSuggestion> suggestions) {
        return new SessionResponse(
                session.getId(),
                session.getStartedAtUtc(),
                session.getSleepStartEstimatedAtUtc(),
                session.getEndedAtUtc(),
                session.isOpen(),
                session.getQualityRating(),
                session.getNote(),
                suggestions);
    }
}
