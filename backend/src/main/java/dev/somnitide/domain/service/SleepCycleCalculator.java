package dev.somnitide.domain.service;

import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.model.WakeSuggestion;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Domain service for sleep cycle calculations.
 * Pure Java — no Spring dependency whatsoever.
 *
 * <h2>Formula</h2>
 * {@code wakeTime = nowUtc + latencyMinutes + (n * cycleLengthMinutes) + bufferMinutes}
 * for n in [minCycles..maxCycles].
 *
 * <h2>Recommended cycle</h2>
 * Cycle 5 is preferred if within range; otherwise the middle index of the
 * suggestions list is used (index = size / 2).
 */
public class SleepCycleCalculator {

    // ---- Preference bounds ------------------------------------------------
    private static final int LATENCY_MIN = 0;
    private static final int LATENCY_MAX = 60;
    private static final int CYCLE_LENGTH_MIN = 60;
    private static final int CYCLE_LENGTH_MAX = 120;
    private static final int CYCLES_MIN = 1;
    private static final int CYCLES_MAX = 8;
    private static final int BUFFER_MIN = 0;
    private static final int BUFFER_MAX = 30;
    private static final int PREFERRED_CYCLES = 5;

    /**
     * Validates a {@link UserPreferences} instance.
     * Throws {@link DomainException} with code {@code INVALID_PREFERENCES}
     * if any constraint is violated.
     */
    public void validatePreferences(UserPreferences prefs) {
        if (prefs.sleepLatencyMinutes() < LATENCY_MIN || prefs.sleepLatencyMinutes() > LATENCY_MAX) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "sleepLatencyMinutes must be between " + LATENCY_MIN + " and " + LATENCY_MAX
                            + " but was " + prefs.sleepLatencyMinutes());
        }
        if (prefs.cycleLengthMinutes() < CYCLE_LENGTH_MIN || prefs.cycleLengthMinutes() > CYCLE_LENGTH_MAX) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "cycleLengthMinutes must be between " + CYCLE_LENGTH_MIN + " and " + CYCLE_LENGTH_MAX
                            + " but was " + prefs.cycleLengthMinutes());
        }
        if (prefs.minCycles() < CYCLES_MIN || prefs.minCycles() > CYCLES_MAX) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "minCycles must be between " + CYCLES_MIN + " and " + CYCLES_MAX
                            + " but was " + prefs.minCycles());
        }
        if (prefs.maxCycles() < CYCLES_MIN || prefs.maxCycles() > CYCLES_MAX) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "maxCycles must be between " + CYCLES_MIN + " and " + CYCLES_MAX
                            + " but was " + prefs.maxCycles());
        }
        if (prefs.minCycles() > prefs.maxCycles()) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "minCycles (" + prefs.minCycles() + ") must be <= maxCycles (" + prefs.maxCycles() + ")");
        }
        if (prefs.bufferMinutes() < BUFFER_MIN || prefs.bufferMinutes() > BUFFER_MAX) {
            throw new DomainException(
                    "INVALID_PREFERENCES",
                    "bufferMinutes must be between " + BUFFER_MIN + " and " + BUFFER_MAX
                            + " but was " + prefs.bufferMinutes());
        }
    }

    /**
     * Calculates wake-time suggestions based on sleep cycle science.
     * Validates preferences before computing.
     *
     * @param nowUtc the moment the user clicked "going to sleep" (UTC)
     * @param prefs  validated user preferences
     * @return ordered list of {@link WakeSuggestion} from fewest to most cycles
     */
    public List<WakeSuggestion> calculateWakeSuggestions(Instant nowUtc, UserPreferences prefs) {
        validatePreferences(prefs);

        long latencySeconds = prefs.sleepLatencyMinutes() * 60L;
        long cycleSeconds = prefs.cycleLengthMinutes() * 60L;
        long bufferSeconds = prefs.bufferMinutes() * 60L;

        // Build raw list of (cycleCount, wakeTime)
        List<int[]> cycleEntries = new ArrayList<>();
        for (int n = prefs.minCycles(); n <= prefs.maxCycles(); n++) {
            cycleEntries.add(new int[] { n });
        }

        int size = cycleEntries.size();

        // Determine which cycle count is "recommended"
        boolean fiveInRange = prefs.minCycles() <= PREFERRED_CYCLES
                && PREFERRED_CYCLES <= prefs.maxCycles();

        int recommendedCycles;
        if (fiveInRange) {
            recommendedCycles = PREFERRED_CYCLES;
        } else {
            // Middle index of the list
            int middleIndex = size / 2;
            recommendedCycles = prefs.minCycles() + middleIndex;
        }

        List<WakeSuggestion> suggestions = new ArrayList<>(size);
        for (int[] entry : cycleEntries) {
            int n = entry[0];
            Instant wakeTime = nowUtc
                    .plusSeconds(latencySeconds)
                    .plusSeconds((long) n * cycleSeconds)
                    .plusSeconds(bufferSeconds);

            suggestions.add(new WakeSuggestion(wakeTime, n, n == recommendedCycles));
        }

        return suggestions;
    }
}
