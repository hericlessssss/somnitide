package dev.somnitide.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class SleepProgressCalculatorTest {

    private SleepProgressCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new SleepProgressCalculator();
    }

    @ParameterizedTest
    @DisplayName("Duration Score: Rule coverage based on sleep hours")
    @CsvSource({
            "120, 0",   // 2h  -> 0
            "180, 0",   // 3h  -> 0 (lower bound of 3<=h<6)
            "300, 27",  // 5h  -> round(((5-3)/3)*40) = round(0.666*40) = 27
            "359, 40",  // ~6h -> round(((5.98-3)/3)*40) = 40 (upper bound)
            "360, 60",  // 6h  -> 60
            "450, 60",  // 7.5h -> 60
            "540, 60",  // 9h  -> 60
            "570, 55",  // 9.5h -> round(60 - ((9.5-9)*10)) = 60 - 5 = 55
            "600, 50",  // 10h -> 60 - 10 = 50
            "660, 40"   // 11h -> 40
    })
    void calculateDurationScore(int minutes, int expectedScore) {
        assertThat(calculator.computeDurationScore(minutes)).isEqualTo(expectedScore);
    }

    @ParameterizedTest
    @DisplayName("Quality Score: Rule coverage based on rating 1-5")
    @CsvSource({
            "1, 0",
            "2, 10",
            "3, 20",
            "4, 30",
            "5, 40"
    })
    void calculateQualityScore(Integer rating, int expectedScore) {
        assertThat(calculator.computeQualityScore(rating)).isEqualTo(expectedScore);
    }

    @Test
    @DisplayName("Quality Score: null rating should return 0")
    void calculateQualityScore_null() {
        assertThat(calculator.computeQualityScore(null)).isEqualTo(0);
    }

    @ParameterizedTest
    @DisplayName("Streak Bonus: Rule coverage based on consecutive days")
    @CsvSource({
            "0, 0",
            "1, 0",
            "2, 2",
            "3, 4",
            "4, 4",
            "5, 6",
            "6, 6",
            "7, 8",
            "13, 8",
            "14, 10",
            "20, 10"
    })
    void calculateStreakBonus(int streakDays, int expectedBonus) {
        assertThat(calculator.computeStreakBonus(streakDays)).isEqualTo(expectedBonus);
    }

    @Test
    @DisplayName("Total Score: Happy path 7h30, rating 5, streak 7")
    void calculateTotalScore_happyPath() {
        // duration: 450m (7.5h) -> 60
        // quality: rating 5 -> 40
        // streak: 7 days -> 8
        // total: 108
        int total = calculator.computeTotal(450, 5, 7);
        assertThat(total).isEqualTo(108);
    }

    @Test
    @DisplayName("Total Score: Clamp max to 110")
    void calculateTotalScore_clamped() {
        // duration: 450m -> 60
        // quality: 5 -> 40
        // streak: 15 -> 10
        // total: 110
        // If we had more bonus it would clamp
        int total = calculator.computeTotal(450, 5, 14);
        assertThat(total).isEqualTo(110);
    }
}
