package dev.somnitide.application.usecase;

import dev.somnitide.domain.exception.DomainException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UpdatePreferencesTest {

    private UpdatePreferences useCase;

    @BeforeEach
    void setUp() {
        useCase = new UpdatePreferences();
    }

    @Test
    void execute_always_throwsLockedException() {
        UpdatePreferences.Request request = new UpdatePreferences.Request(
                20, 100, 4, 6, 10);

        assertThatThrownBy(() -> useCase.execute("user-123", request))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("locked");
    }
}
