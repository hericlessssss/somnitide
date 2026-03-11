package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.service.SleepProgressCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GetProgressTest {

    private SleepSessionRepository repository;
    private SleepProgressCalculator calculator;
    private GetProgress useCase;

    @BeforeEach
    void setUp() {
        repository = mock(SleepSessionRepository.class);
        calculator = new SleepProgressCalculator();
        useCase = new GetProgressUseCase(repository, calculator);
    }

    @Test
    @DisplayName("Execute: Happy path with multiple days and sessions")
    void execute_happyPath() {
        String userId = "user-1";
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate yesterday = today.minusDays(1);

        // Day 1 (Yesterday): Ends in yesterday UTC
        Instant s1End = yesterday.atTime(6, 0).toInstant(ZoneOffset.UTC);
        Instant s1Start = s1End.minus(Duration.ofHours(8));
        SleepSession s1 = new SleepSession(userId, s1Start, 14);
        s1.end(s1End, 5, null);

        // Day 2 (Today): Ends in today UTC
        Instant s2End = today.atTime(15, 0).toInstant(ZoneOffset.UTC);
        Instant s2Start = s2End.minus(Duration.ofHours(1));
        SleepSession s2 = new SleepSession(userId, s2Start, 14);
        s2.end(s2End, 2, "Nap");

        Instant s3End = today.atTime(23, 0).toInstant(ZoneOffset.UTC);
        Instant s3Start = s3End.minus(Duration.ofHours(8));
        SleepSession s3 = new SleepSession(userId, s3Start, 14);
        s3.end(s3End, 4, null);

        // Note: s3 is longer than s2 on the same day (today)
        when(repository.findByUserIdAndEndedAtAfter(eq(userId), any(Instant.class)))
                .thenReturn(List.of(s3, s2, s1));

        GetProgress.Response result = useCase.execute(userId, 7);

        assertThat(result.rangeDays()).isEqualTo(7);
        assertThat(result.days()).hasSize(2); 

        assertThat(result.days().get(0).date()).isEqualTo(today);
        assertThat(result.days().get(1).date()).isEqualTo(yesterday);

        // Streak check: Today and Yesterday are consecutive
        assertThat(result.streakDays()).isEqualTo(2);
    }

    @Test
    @DisplayName("Execute: Picks session with longest sleepMinutes when multiple on same day")
    void execute_picksLongestSession() {
        String userId = "user-1";
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant now = today.atStartOfDay(ZoneOffset.UTC).toInstant();

        // Session A: 2h
        SleepSession sA = new SleepSession(userId, now.plusSeconds(3600), 0);
        sA.end(now.plusSeconds(3 * 3600), 5, null); // 2h = 120m

        // Session B: 4h
        SleepSession sB = new SleepSession(userId, now.plusSeconds(10 * 3600), 0);
        sB.end(now.plusSeconds(14 * 3600), 3, null); // 4h = 240m

        when(repository.findByUserIdAndEndedAtAfter(eq(userId), any(Instant.class)))
                .thenReturn(List.of(sB, sA));

        GetProgress.Response result = useCase.execute(userId, 7);

        assertThat(result.days()).hasSize(1);
        assertThat(result.days().get(0).sleepMinutes()).isEqualTo(240);
        assertThat(result.days().get(0).rating()).isEqualTo(3);
    }
}
