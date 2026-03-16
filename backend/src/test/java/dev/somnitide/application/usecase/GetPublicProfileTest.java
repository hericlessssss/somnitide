package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GetPublicProfileTest {

    private UserProfileRepository repository;
    private SleepSessionRepository sessionRepository;
    private GetProgress getProgress;
    private GetPublicProfile getPublicProfile;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(UserProfileRepository.class);
        sessionRepository = Mockito.mock(SleepSessionRepository.class);
        getProgress = Mockito.mock(GetProgress.class);
        getPublicProfile = new GetPublicProfile(repository, sessionRepository, getProgress);
    }

    @Test
    void shouldReturnProfileWithRankPosition() {
        // Arrange
        String handle = "@testuser";
        UserProfile profile = new UserProfile("user-1", handle, "seed", 500, Instant.now(), Instant.now());
        
        when(repository.findByHandle(handle)).thenReturn(Optional.of(profile));
        when(repository.countUsersWithScoreAbove(500)).thenReturn(1L); // 1 person above means rank 2
        
        when(getProgress.execute("user-1", 30)).thenReturn(new GetProgress.Response(
            30, 3, 85.0, 500.0, 420, null, List.of()
        ));
        when(sessionRepository.findClosedByUserId("user-1", 1)).thenReturn(List.of());

        // Act
        Optional<GetPublicProfile.PublicProfileWithRank> result = getPublicProfile.execute(handle);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(2, result.get().rankPosition());
        assertEquals(handle, result.get().profile().getHandle());
    }

    @Test
    void shouldReturnCorrectRankForAnyUser() {
        // Arrange
        String handle = "@testuser";
        UserProfile profile = new UserProfile("user-1", handle, "seed", 10, Instant.now(), Instant.now());
        
        when(repository.findByHandle(handle)).thenReturn(Optional.of(profile));
        when(repository.countUsersWithScoreAbove(10)).thenReturn(150L); // 150 people above means rank 151
        
        when(getProgress.execute("user-1", 30)).thenReturn(new GetProgress.Response(
            30, 0, 10.0, 10.0, 360, null, List.of()
        ));
        when(sessionRepository.findClosedByUserId("user-1", 1)).thenReturn(List.of());
        
        // Act
        Optional<GetPublicProfile.PublicProfileWithRank> result = getPublicProfile.execute(handle);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(151, result.get().rankPosition());
    }
}
