package dev.somnitide.domain;

import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.model.WakeSuggestion;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * TDD unit tests for SleepCycleCalculator.
 * Written BEFORE the implementation (Red → Green → Refactor).
 * No Spring context — pure Java.
 */
class SleepCycleCalculatorTest {

        private SleepCycleCalculator calculator;

        @BeforeEach
        void setUp() {
                calculator = new SleepCycleCalculator();
        }

        // -----------------------------------------------------------------------
        // Happy path — default preferences
        // nowUtc = 2026-03-03T10:00:00Z
        // latency=14min, cycle=90min, min=4, max=6, buffer=5min
        //
        // Formula: nowUtc + latency + (n * cycle) + buffer
        // n=4 → 10:00 + 14 + 360 + 5 = 16:19:00Z
        // n=5 → 10:00 + 14 + 450 + 5 = 17:49:00Z ← Recommended (5 cycles)
        // n=6 → 10:00 + 14 + 540 + 5 = 19:19:00Z
        // -----------------------------------------------------------------------
        @Test
        @DisplayName("Happy path: default preferences produce 3 suggestions with correct times")
        void happyPath_defaultPreferences_returnsSuggestionsWithCorrectTimes() {
                Instant nowUtc = Instant.parse("2026-03-03T10:00:00Z");
                UserPreferences prefs = UserPreferences.defaults("user-1");

                List<WakeSuggestion> suggestions = calculator.calculateWakeSuggestions(nowUtc, prefs);

                assertThat(suggestions).hasSize(3);

                WakeSuggestion fourCycles = suggestions.get(0);
                assertThat(fourCycles.cycles()).isEqualTo(4);
                assertThat(fourCycles.wakeTimeUtc()).isEqualTo(Instant.parse("2026-03-03T16:19:00Z"));
                assertThat(fourCycles.isRecommended()).isFalse();

                WakeSuggestion fiveCycles = suggestions.get(1);
                assertThat(fiveCycles.cycles()).isEqualTo(5);
                assertThat(fiveCycles.wakeTimeUtc()).isEqualTo(Instant.parse("2026-03-03T17:49:00Z"));
                assertThat(fiveCycles.isRecommended()).isTrue(); // 5 cycles is the recommended

                WakeSuggestion sixCycles = suggestions.get(2);
                assertThat(sixCycles.cycles()).isEqualTo(6);
                assertThat(sixCycles.wakeTimeUtc()).isEqualTo(Instant.parse("2026-03-03T19:19:00Z"));
                assertThat(sixCycles.isRecommended()).isFalse();
        }

        @Test
        @DisplayName("Happy path: exactly one suggestion is marked as recommended")
        void happyPath_exactlyOneRecommended() {
                Instant nowUtc = Instant.parse("2026-03-03T10:00:00Z");
                UserPreferences prefs = UserPreferences.defaults("user-1");

                List<WakeSuggestion> suggestions = calculator.calculateWakeSuggestions(nowUtc, prefs);

                long recommendedCount = suggestions.stream().filter(WakeSuggestion::isRecommended).count();
                assertThat(recommendedCount).isEqualTo(1);
        }

        // -----------------------------------------------------------------------
        // Edge case — minCycles == maxCycles
        // Only one suggestion produced; it must be marked as recommended.
        // -----------------------------------------------------------------------
        @Test
        @DisplayName("Edge case: minCycles == maxCycles returns exactly 1 suggestion marked recommended")
        void edgeCase_minEqualsMaxCycles_returnsOneSuggestion() {
                Instant nowUtc = Instant.parse("2026-03-03T10:00:00Z");
                UserPreferences prefs = new UserPreferences(
                                "user-2",
                                14, // latency
                                90, // cycle
                                3, // minCycles == maxCycles
                                3, // maxCycles
                                5, // buffer
                                Instant.now());

                List<WakeSuggestion> suggestions = calculator.calculateWakeSuggestions(nowUtc, prefs);

                assertThat(suggestions).hasSize(1);
                assertThat(suggestions.get(0).cycles()).isEqualTo(3);
                assertThat(suggestions.get(0).isRecommended()).isTrue();
                // n=3 → 10:00 + 14min latency + 270min (3×90) + 5min buffer = 289min →
                // 14:49:00Z
                assertThat(suggestions.get(0).wakeTimeUtc()).isEqualTo(Instant.parse("2026-03-03T14:49:00Z"));
        }

        // -----------------------------------------------------------------------
        // Edge case — 5 cycles not in range; recommended is middle of range
        // minCycles=4, maxCycles=4 would be only-one; but let's test a range
        // without 5 where middle index is picked.
        // -----------------------------------------------------------------------
        @Test
        @DisplayName("Edge case: when cycle 5 not in range, recommended is middle of range")
        void edgeCase_fiveNotInRange_recommendedIsMiddle() {
                Instant nowUtc = Instant.parse("2026-03-03T10:00:00Z");
                // Range 1..3 — no cycle 5 available; size=3, middle index=1 → cycles=2
                UserPreferences prefs = new UserPreferences(
                                "user-3",
                                14, // latency
                                90, // cycle
                                1, // minCycles
                                3, // maxCycles
                                5, // buffer
                                Instant.now());

                List<WakeSuggestion> suggestions = calculator.calculateWakeSuggestions(nowUtc, prefs);

                assertThat(suggestions).hasSize(3);
                long recommendedCount = suggestions.stream().filter(WakeSuggestion::isRecommended).count();
                assertThat(recommendedCount).isEqualTo(1);

                // Middle index for size=3 is index 1 → cycles=2
                WakeSuggestion recommended = suggestions.stream()
                                .filter(WakeSuggestion::isRecommended)
                                .findFirst()
                                .orElseThrow();
                assertThat(recommended.cycles()).isEqualTo(2);
        }

        // -----------------------------------------------------------------------
        // Error — invalid cycleLengthMinutes (below minimum 60)
        // -----------------------------------------------------------------------
        @Test
        @DisplayName("Error: cycleLengthMinutes=30 throws DomainException with INVALID_PREFERENCES code")
        void error_invalidCycleLength_throwsDomainException() {
                UserPreferences invalid = new UserPreferences(
                                "user-4",
                                14,
                                30, // invalid: below minimum 60
                                4,
                                6,
                                5,
                                Instant.now());

                assertThatThrownBy(() -> calculator.validatePreferences(invalid))
                                .isInstanceOf(DomainException.class)
                                .satisfies(ex -> {
                                        DomainException de = (DomainException) ex;
                                        assertThat(de.getErrorCode()).isEqualTo("INVALID_PREFERENCES");
                                        assertThat(de.getMessage()).contains("cycleLengthMinutes");
                                });
        }

        @Test
        @DisplayName("Error: sleepLatencyMinutes above 60 throws DomainException")
        void error_invalidLatencyAboveMax_throwsDomainException() {
                UserPreferences invalid = new UserPreferences(
                                "user-5",
                                61, // invalid: above maximum 60
                                90,
                                4,
                                6,
                                5,
                                Instant.now());

                assertThatThrownBy(() -> calculator.validatePreferences(invalid))
                                .isInstanceOf(DomainException.class)
                                .hasMessageContaining("sleepLatencyMinutes")
                                .satisfies(ex -> assertThat(((DomainException) ex).getErrorCode())
                                                .isEqualTo("INVALID_PREFERENCES"));
        }

        @Test
        @DisplayName("Error: minCycles greater than maxCycles throws DomainException")
        void error_minCyclesGreaterThanMax_throwsDomainException() {
                UserPreferences invalid = new UserPreferences(
                                "user-6",
                                14,
                                90,
                                6, // min > max
                                4,
                                5,
                                Instant.now());

                assertThatThrownBy(() -> calculator.validatePreferences(invalid))
                                .isInstanceOf(DomainException.class)
                                .hasMessageContaining("minCycles")
                                .satisfies(ex -> assertThat(((DomainException) ex).getErrorCode())
                                                .isEqualTo("INVALID_PREFERENCES"));
        }

        @Test
        @DisplayName("Error: bufferMinutes above 30 throws DomainException")
        void error_bufferAboveMax_throwsDomainException() {
                UserPreferences invalid = new UserPreferences(
                                "user-7",
                                14,
                                90,
                                4,
                                6,
                                31, // invalid: above maximum 30
                                Instant.now());

                assertThatThrownBy(() -> calculator.validatePreferences(invalid))
                                .isInstanceOf(DomainException.class)
                                .hasMessageContaining("bufferMinutes")
                                .satisfies(ex -> assertThat(((DomainException) ex).getErrorCode())
                                                .isEqualTo("INVALID_PREFERENCES"));
        }
}
