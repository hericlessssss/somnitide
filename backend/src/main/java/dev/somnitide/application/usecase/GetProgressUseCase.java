package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.service.SleepProgressCalculator;
import dev.somnitide.domain.service.StreakCalculator;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GetProgressUseCase implements GetProgress {

    private final SleepSessionRepository repository;
    private final SleepProgressCalculator calculator;
    private final StreakCalculator streakCalculator;

    public GetProgressUseCase(SleepSessionRepository repository, 
                             SleepProgressCalculator calculator,
                             StreakCalculator streakCalculator) {
        this.repository = repository;
        this.calculator = calculator;
        this.streakCalculator = streakCalculator;
    }

    @Override
    public Response execute(String userId, int days) {
        Instant after = Instant.now().minus(Duration.ofDays(days));
        List<SleepSession> sessions = repository.findByUserIdAndEndedAtAfter(userId, after);

        // 1. Group by UTC date and pick longest session (filtering out invalid ones)
        Map<LocalDate, SleepSession> longestSessionsByDay = sessions.stream()
                .filter(s -> s.getEndedAtUtc() != null && s.isValidDuration())
                .collect(Collectors.toMap(
                        s -> LocalDate.ofInstant(s.getEndedAtUtc(), ZoneOffset.UTC),
                        s -> s,
                        (s1, s2) -> getSleepMinutes(s1) >= getSleepMinutes(s2) ? s1 : s2
                ));

        // 2. Sort dates descending
        List<LocalDate> sortedDates = longestSessionsByDay.keySet().stream()
                .sorted(Comparator.reverseOrder())
                .toList();

        // 3. Calculate streak
        int streak = streakCalculator.calculateStreak(sortedDates);

        // 4. Calculate daily results
        List<DayResult> dayResults = new ArrayList<>();
        double totalScoreSum = 0;
        int totalSleepMinutesSum = 0;
        int maxScore = -1;
        LocalDate bestDayDate = null;

        for (LocalDate date : sortedDates) {
            SleepSession session = longestSessionsByDay.get(date);
            int sleepMinutes = getSleepMinutes(session);
            
            // For bonus, we might need the streak up to that day, 
            // but the simplified rule usually refers to current overall streak or a local streak.
            // Requirement says: "streakDays (0-10) ... streak 0..1: 0, 2: 2... 14+: 10"
            // Let's use the overall current streak for all days in this range to simplify V1, 
            // or better, calculate the streak bonus based on the streak *at that point*?
            // Actually, "streakDays" in the formula is usually "current streak".
            // Let's use the overall streak for simplicity of V1 as per "is progresso pessoal".
            
            int durationScore = calculator.computeDurationScore(sleepMinutes);
            int qualityScore = calculator.computeQualityScore(session.getQualityRating());
            int streakBonus = calculator.computeStreakBonus(streak);
            int totalScore = calculator.computeTotal(sleepMinutes, session.getQualityRating(), streak);

            dayResults.add(new DayResult(
                    date,
                    sleepMinutes,
                    session.getQualityRating(),
                    durationScore,
                    qualityScore,
                    streakBonus,
                    totalScore
            ));

            totalScoreSum += totalScore;
            totalSleepMinutesSum += sleepMinutes;
            if (totalScore > maxScore) {
                maxScore = totalScore;
                bestDayDate = date;
            }
        }

        Double avgScore = dayResults.isEmpty() ? null : totalScoreSum / dayResults.size();
        int avgSleepMinutes = dayResults.isEmpty() ? 0 : (int) (totalSleepMinutesSum / dayResults.size());
        BestDay bestDay = bestDayDate != null ? new BestDay(bestDayDate, maxScore) : null;

        return new Response(
                days,
                streak,
                avgScore,
                totalScoreSum,
                avgSleepMinutes,
                bestDay,
                dayResults
        );
    }

    private int getSleepMinutes(SleepSession session) {
        if (session.getEndedAtUtc() == null) return 0;
        long minutes = Duration.between(session.getSleepStartEstimatedAtUtc(), session.getEndedAtUtc()).toMinutes();
        return (int) Math.max(0, minutes);
    }
}
