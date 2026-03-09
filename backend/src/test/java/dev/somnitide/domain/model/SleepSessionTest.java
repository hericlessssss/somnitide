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
}
