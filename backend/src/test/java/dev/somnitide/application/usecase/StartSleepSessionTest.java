package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.model.WakeSuggestion;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StartSleepSessionTest {

    private SleepSessionRepository sessionRepository;
    private GetPreferences getPreferences;
    private SleepCycleCalculator calculator;
    private StartSleepSession useCase;

    @BeforeEach
    void setUp() {
        sessionRepository = mock(SleepSessionRepository.class);
        getPreferences = mock(GetPreferences.class);
        calculator = mock(SleepCycleCalculator.class);
        useCase = new StartSleepSession(sessionRepository, getPreferences, calculator);
    }

    @Test
    void execute_noOpenSession_startsNewAndReturnsSuggestions() {
        String userId = "user-1";
        when(sessionRepository.findOpenByUserId(userId)).thenReturn(Optional.empty());

        UserPreferences prefs = UserPreferences.defaults(userId);
        when(getPreferences.execute(userId)).thenReturn(prefs);

        List<WakeSuggestion> expectedSuggestions = List.of(
                new WakeSuggestion(Instant.now(), 1, false),
                new WakeSuggestion(Instant.now(), 2, true));
        when(calculator.calculateWakeSuggestions(any(), eq(prefs)))
                .thenReturn(expectedSuggestions);

        when(sessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        StartSleepSession.Response response = useCase.execute(userId);

        assertThat(response.session().getUserId()).isEqualTo(userId);
        assertThat(response.session().isOpen()).isTrue();
        assertThat(response.suggestions()).isEqualTo(expectedSuggestions);

        verify(sessionRepository).save(any(SleepSession.class));
    }

    @Test
    void execute_alreadyOpenSession_throwsDomainException() {
        String userId = "user-2";
        SleepSession openSession = new SleepSession(userId, Instant.now(), 14);
        when(sessionRepository.findOpenByUserId(userId)).thenReturn(Optional.of(openSession));

        assertThatThrownBy(() -> useCase.execute(userId))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("open");

        verify(sessionRepository, never()).save(any());
        verify(getPreferences, never()).execute(any());
    }
}
