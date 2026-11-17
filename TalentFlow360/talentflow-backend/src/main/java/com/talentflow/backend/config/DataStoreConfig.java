package com.talentflow.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.talentflow.backend.repository")
@EnableMongoRepositories(basePackages = "com.talentflow.backend.mongorepository")
public class DataStoreConfig {
}
