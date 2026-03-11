package dev.somnitide.domain.service;

/**
 * Domain service for calculating sleep progress scores based on Formula V1.
 * Pure Java — no Spring dependencies.
 */
public class SleepProgressCalculator {

    /**
     * computeDurationScore (0..60)
     * h = sleepMinutes / 60.0
     * - if h < 3: 0
     * - if 3 <= h < 6: round(((h - 3) / 3) * 40)
     * - if 6 <= h <= 9: 60
     * - if 9 < h <= 10: round(60 - ((h - 9) * 10))
     * - if h > 10: 40
     */
    public int computeDurationScore(int sleepMinutes) {
        double hours = sleepMinutes / 60.0;

        if (hours < 3) {
            return 0;
        } else if (hours < 6) {
            return (int) Math.round(((hours - 3) / 3.0) * 40.0);
        } else if (hours <= 9) {
            return 60;
        } else if (hours <= 10) {
            return (int) Math.round(60 - ((hours - 9) * 10.0));
        } else {
            return 40;
        }
    }

    /**
     * computeQualityScore (0..40)
     * - rating null: 0
     * - rating 1: 0
     * - 2: 10
     * - 3: 20
     * - 4: 30
     * - 5: 40
     */
    public int computeQualityScore(Integer rating) {
        if (rating == null || rating <= 1) {
            return 0;
        }
        if (rating == 2) return 10;
        if (rating == 3) return 20;
        if (rating == 4) return 30;
        if (rating == 5) return 40;
        return 0;
    }

    /**
     * computeStreakBonus (0..10)
     * - streak 0..1: 0
     * - 2: 2
     * - 3..4: 4
     * - 5..6: 6
     * - 7..13: 8
     * - 14+: 10
     */
    public int computeStreakBonus(int streakDays) {
        if (streakDays <= 1) return 0;
        if (streakDays == 2) return 2;
        if (streakDays <= 4) return 4;
        if (streakDays <= 6) return 6;
        if (streakDays <= 13) return 8;
        return 10;
    }

    /**
     * totalScore = clamp(durationScore + qualityScore + streakBonus, 0, 110)
     */
    public int computeTotal(int sleepMinutes, Integer rating, int streakDays) {
        int duration = computeDurationScore(sleepMinutes);
        int quality = computeQualityScore(rating);
        int streak = computeStreakBonus(streakDays);

        int total = duration + quality + streak;
        return Math.min(Math.max(total, 0), 110);
    }
}
