package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserProfileRepository;
import dev.somnitide.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class GetPublicProfile {

    private final UserProfileRepository repository;

    public GetPublicProfile(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Optional<UserProfile> execute(String handle) {
        if (!handle.startsWith("@")) {
            handle = "@" + handle;
        }
        return repository.findByHandle(handle);
    }
}
