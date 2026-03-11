package dev.somnitide.domain.model;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class SleepSessionTest {

    @Test
    void shouldEndSessionWithValidRating() {
        SleepSession session = new SleepSession("user-1", Instant.now(), 15);
        Instant end = Instant.now().plusSeconds(3600);

        session.end(end, 5, "Felt great");

        assertEquals(5, session.getQualityRating());
        assertEquals("Felt great", session.getNote());
        assertEquals(end, session.getEndedAtUtc());
    }

    @Test
    void shouldThrowExceptionWhenRatingIsTooHigh() {
        SleepSession session = new SleepSession("user-1", Instant.now(), 15);
        assertThrows(IllegalArgumentException.class, () -> {
            session.end(Instant.now(), 6, "Overflow");
        });
    }

    @Test
    void shouldThrowExceptionWhenRatingIsTooLow() {
        SleepSession session = new SleepSession("user-1", Instant.now(), 15);
        assertThrows(IllegalArgumentException.class, () -> {
            session.end(Instant.now(), 0, "Underflow");
        });
    }

    @Test
    void shouldAllowNullRating() {
        SleepSession session = new SleepSession("user-1", Instant.now(), 15);
        session.end(Instant.now(), null, null);
        assertNull(session.getQualityRating());
    }

    @Test
    void isStale_shouldReturnTrueIfStartedMoreThan14HoursAgo() {
        Instant wayBack = Instant.now().minus(java.time.Duration.ofHours(15));
        SleepSession session = new SleepSession("user-1", wayBack, 15);
        
        assertTrue(session.isStale(Instant.now()));
    }

    @Test
    void isValidDuration_shouldReturnFalseIfDurationExceeds14Hours() {
        Instant start = Instant.now().minus(java.time.Duration.ofHours(20));
        Instant end = Instant.now();
        SleepSession session = new SleepSession("id", "user-1", start, start, end, 3, null, 0);
        
        assertFalse(session.isValidDuration());
    }
}
