package com.talentflow.backend.controller;

import com.talentflow.backend.dto.profile.SkillDTO;
import com.talentflow.backend.entity.SkillCategory;
import com.talentflow.backend.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@Tag(name = "Skills Catalog", description = "Standard skills catalog, search, and category management APIs")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    @Operation(summary = "Search or retrieve standard skills catalog")
    public ResponseEntity<List<SkillDTO>> getSkills(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) SkillCategory category) {
        if (category != null) {
            return ResponseEntity.ok(skillService.getSkillsByCategory(category));
        }
        return ResponseEntity.ok(skillService.searchSkills(q));
    }

    @PostMapping
    @Operation(summary = "Create or register a new skill in the catalog")
    public ResponseEntity<SkillDTO> createSkill(@Valid @RequestBody SkillDTO request) {
        SkillDTO created = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

