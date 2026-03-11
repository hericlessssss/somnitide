package dev.somnitide.infrastructure.web.dto.response;

import dev.somnitide.application.usecase.GetProgress;

import java.time.LocalDate;
import java.util.List;

public record ProgressResponse(
        int rangeDays,
        int streakDays,
        double avgScore,
        double totalScore,
        int avgSleepMinutes,
        BestDayResponse bestDay,
        List<DayResultResponse> days
) {
    public record DayResultResponse(
            LocalDate date,
            int sleepMinutes,
            Integer rating,
            int durationScore,
            int qualityScore,
            int streakBonus,
            int totalScore
    ) {
        public static DayResultResponse from(GetProgress.DayResult domain) {
            return new DayResultResponse(
                    domain.date(),
                    domain.sleepMinutes(),
                    domain.rating(),
                    domain.durationScore(),
                    domain.qualityScore(),
                    domain.streakBonus(),
                    domain.totalScore()
            );
        }
    }

    public record BestDayResponse(LocalDate date, int score) {
        public static BestDayResponse from(GetProgress.BestDay domain) {
            if (domain == null) return null;
            return new BestDayResponse(domain.date(), domain.score());
        }
    }

    public static ProgressResponse from(GetProgress.Response domain) {
        return new ProgressResponse(
                domain.rangeDays(),
                domain.streakDays(),
                domain.avgScore(),
                domain.totalScore(),
                domain.avgSleepMinutes(),
                BestDayResponse.from(domain.bestDay()),
                domain.days().stream().map(DayResultResponse::from).toList()
        );
    }
}
