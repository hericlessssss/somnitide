package dev.somnitide.domain.service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

public class StreakCalculator {

    public int calculateStreak(List<LocalDate> sortedDates) {
        if (sortedDates.isEmpty()) return 0;
        
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate lastDate = sortedDates.get(0);
        
        if (!lastDate.equals(today) && !lastDate.equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 1;
        for (int i = 0; i < sortedDates.size() - 1; i++) {
            if (sortedDates.get(i).minusDays(1).equals(sortedDates.get(i + 1))) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
}
