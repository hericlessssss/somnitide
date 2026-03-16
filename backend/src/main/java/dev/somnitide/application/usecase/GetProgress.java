package dev.somnitide.application.usecase;

import java.time.LocalDate;
import java.util.List;

public interface GetProgress {

    record DayResult(
            LocalDate date,
            int sleepMinutes,
            Integer rating,
            int durationScore,
            int qualityScore,
            int streakBonus,
            int totalScore
    ) {}

    record BestDay(LocalDate date, int score) {}

    record Response(
            int rangeDays,
            int streakDays,
            Double avgScore,
            double totalScore,
            int avgSleepMinutes,
            BestDay bestDay,
            List<DayResult> days
    ) {}

    Response execute(String userId, int days);
}
