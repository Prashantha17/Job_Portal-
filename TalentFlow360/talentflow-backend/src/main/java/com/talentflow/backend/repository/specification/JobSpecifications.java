package com.talentflow.backend.repository.specification;

import com.talentflow.backend.entity.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecifications {

    public static Specification<Job> filterJobs(String keyword,
                                                String location,
                                                WorkplaceType workplaceType,
                                                EmploymentType employmentType,
                                                Double minSalary,
                                                Double maxSalary,
                                                JobStatus status,
                                                List<Long> skillIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 2. Keyword Filter (Title, Description, or Company Name)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                Join<Job, Company> companyJoin = root.join("company");
                Predicate companyLike = cb.like(cb.lower(companyJoin.get("name")), pattern);
                predicates.add(cb.or(titleLike, descLike, companyLike));
            }

            // 3. Location Filter
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }

            // 4. Workplace Type
            if (workplaceType != null) {
                predicates.add(cb.equal(root.get("workplaceType"), workplaceType));
            }

            // 5. Employment Type
            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            // 6. Min Salary
            if (minSalary != null) {
                predicates.add(cb.or(
                        cb.greaterThanOrEqualTo(root.get("maxSalary"), minSalary),
                        cb.greaterThanOrEqualTo(root.get("minSalary"), minSalary)
                ));
            }

            // 7. Max Salary
            if (maxSalary != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("minSalary"), maxSalary));
            }

            // 8. Skill Ids Filter
            if (skillIds != null && !skillIds.isEmpty()) {
                Join<Job, JobSkill> jobSkillJoin = root.join("jobSkills");
                predicates.add(jobSkillJoin.get("skill").get("id").in(skillIds));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

