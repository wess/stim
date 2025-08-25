# Stim Examples

Real-world examples demonstrating Stim's capabilities for building sophisticated Claude Code commands.

## Table of Contents

1. [Simple Examples](#simple-examples)
2. [Workflow Commands](#workflow-commands) 
3. [Development Tools](#development-tools)
4. [Interactive Utilities](#interactive-utilities)
5. [Template Generators](#template-generators)

## Simple Examples

### Hello World

The simplest possible Stim command:

```stim
command hello {
  ask("Hello! What's your name?")
  wait_for_response()
  ask("Nice to meet you! How can I help you today?")
}
```

### Quick Survey

Collect information with a simple survey:

```stim
command survey {
  questions = [
    "What's your primary programming language?",
    "How many years of experience do you have?",
    "What's your favorite development tool?"
  ]
  
  for question in questions {
    ask(question)
    wait_for_response()
  }
  
  ask("Thank you for your responses!")
}
```

### Feature Checker

Check if features are needed:

```stim
command feature_check {
  features = ["Authentication", "Database", "API", "Frontend", "Testing"]
  needed_features = []
  
  for feature in features {
    if (confirm("Do you need " + feature + "?")) {
      ask("Great! " + feature + " will be included.")
    }
  }
}
```

## Workflow Commands

### Project Initialization

A comprehensive project setup workflow:

```stim
command init_project {
  // Gather project information
  ask("What's your project name?")
  wait_for_response()
  
  ask("Brief description of the project?")
  wait_for_response()
  
  // Choose project type
  project_types = ["Web Application", "Mobile App", "CLI Tool", "Library", "API Service"]
  
  ask("What type of project? Options: " + project_types.join(", "))
  wait_for_response()
  
  // Select technologies
  if (confirm("Is this a JavaScript/TypeScript project?")) {
    frameworks = ["React", "Vue", "Angular", "Next.js", "Express", "Fastify"]
    ask("Which framework? Options: " + frameworks.join(", "))
    wait_for_response()
    
    if (confirm("Use TypeScript?")) {
      ask("Excellent choice! TypeScript configuration will be included.")
    }
  }
  
  // Testing setup
  if (confirm("Set up testing?")) {
    test_frameworks = ["Jest", "Vitest", "Cypress", "Playwright"]
    ask("Preferred testing framework? Options: " + test_frameworks.join(", "))
    wait_for_response()
  }
  
  // Create project files
  create_file("README.md", "project_readme_template")
  create_file("package.json", "package_json_template")
  
  if (confirm("Initialize git repository?")) {
    git_init()
    create_file(".gitignore", "gitignore_template")
    ask("Git repository initialized!")
  }
  
  ask("Project setup complete! Ready to start coding?")
}
```

### Code Review Workflow

From the examples directory - comprehensive code review:

```stim
command code_review {
  // Setup
  review_areas = [
    "Security vulnerabilities",
    "Performance issues",
    "Code style and formatting", 
    "Architecture and design",
    "Testing coverage",
    "Documentation quality"
  ]
  
  // Basic info
  ask("What files or directories should I review?")
  wait_for_response()
  
  ask("What's the primary language/framework?")
  wait_for_response()
  
  // Select review focus
  for area in review_areas {
    if (confirm("Include " + area + " in the review?")) {
      ask("Any specific concerns about " + area + "?")
      wait_for_response()
    }
  }
  
  // Perform review
  ask("Analyzing code structure and patterns...")
  wait_for_response()
  
  // Generate report
  create_file("CODE_REVIEW.md", "review_report_template")
  
  if (confirm("Create actionable tasks from findings?")) {
    create_file("REVIEW_TASKS.md", "task_list_template")
  }
  
  ask("Review complete! Check CODE_REVIEW.md for detailed findings.")
}
```

## Development Tools

### Git Commit Helper

Semantic commit workflow:

```stim
command commit {
  // Review changes
  ask("Review git status and diff. What changes were made?")
  wait_for_response()
  
  // Commit type
  commit_types = ["feat", "fix", "docs", "style", "refactor", "test", "chore"]
  ask("Commit type? Options: " + commit_types.join(", "))
  wait_for_response()
  
  // Scope and description
  ask("Scope (e.g., auth, api, ui)?")
  wait_for_response()
  
  ask("Brief description (under 72 chars, imperative mood)?")
  wait_for_response()
  
  // Optional body
  if (confirm("Need detailed commit body?")) {
    ask("Provide detailed explanation:")
    wait_for_response()
  }
  
  // Final commit
  ask("Stage files and create commit with conventional format")
  
  // Reminders
  rules = [
    "Use imperative mood",
    "Keep description under 72 characters", 
    "Don't mention tools or AI assistants",
    "Focus on WHAT changed, not HOW"
  ]
  ask("Remember: " + rules.join("; "))
}
```

### Deployment Checklist

Pre-deployment verification:

```stim
command deploy_check {
  checks = [
    "All tests passing",
    "Code reviewed and approved",
    "Environment variables configured",
    "Database migrations ready",
    "Monitoring and logging setup",
    "Rollback plan prepared"
  ]
  
  failed_checks = []
  
  for check in checks {
    if (!confirm("✓ " + check + "?")) {
      ask("⚠️  " + check + " - what needs to be done?")
      wait_for_response()
    }
  }
  
  if (confirm("All checks passed - ready to deploy?")) {
    environments = ["staging", "production"]
    
    for env in environments {
      if (confirm("Deploy to " + env + "?")) {
        ask("Deploying to " + env + "...")
        ask("Verify deployment at: https://" + env + ".example.com")
        wait_for_response()
      }
    }
  }
}
```

## Interactive Utilities

### API Documentation Generator

Interactive API doc creation:

```stim
command api_docs {
  ask("What's the base URL of your API?")
  wait_for_response()
  
  ask("Brief description of the API?")  
  wait_for_response()
  
  // Authentication
  if (confirm("Does the API require authentication?")) {
    auth_types = ["API Key", "Bearer Token", "Basic Auth", "OAuth"]
    ask("Authentication type? Options: " + auth_types.join(", "))
    wait_for_response()
  }
  
  // Endpoints
  endpoints = []
  adding_endpoints = true
  
  while (adding_endpoints) {
    ask("What's the endpoint path? (e.g., /api/users)")
    wait_for_response()
    
    methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    ask("HTTP method? Options: " + methods.join(", "))
    wait_for_response()
    
    ask("Brief description of this endpoint?")
    wait_for_response()
    
    if (!confirm("Add another endpoint?")) {
      adding_endpoints = false
    }
  }
  
  create_file("API_DOCS.md", "api_documentation_template")
  ask("API documentation generated! Check API_DOCS.md")
}
```

### Bug Report Template

Structured bug reporting:

```stim
command bug_report {
  ask("What's the bug title/summary?")
  wait_for_response()
  
  ask("Detailed description of the bug:")
  wait_for_response()
  
  ask("Steps to reproduce:")
  wait_for_response()
  
  ask("Expected behavior:")
  wait_for_response()
  
  ask("Actual behavior:")
  wait_for_response()
  
  // Environment info
  if (confirm("Include environment details?")) {
    env_questions = [
      "Operating system?",
      "Browser/Node version?", 
      "Application version?",
      "Any relevant configuration?"
    ]
    
    for question in env_questions {
      ask(question)
      wait_for_response()
    }
  }
  
  // Priority
  priorities = ["Critical", "High", "Medium", "Low"]
  ask("Bug priority? Options: " + priorities.join(", "))
  wait_for_response()
  
  create_file("BUG_REPORT.md", "bug_report_template")
  
  if (confirm("Create GitHub issue?")) {
    github_create_issue("bug_title", "bug_report_content")
  }
}
```

## Template Generators

### React Component Generator

Generate React component boilerplate:

```stim
command react_component {
  ask("Component name?")
  wait_for_response()
  
  ask("Brief description of the component?")
  wait_for_response()
  
  // Component type
  if (confirm("Functional component?")) {
    component_type = "functional"
  } else {
    component_type = "class"
  }
  
  // Features
  features = []
  
  if (confirm("Add TypeScript types?")) {
    ask("TypeScript interfaces will be included")
  }
  
  if (confirm("Add CSS modules?")) {
    create_file("Component.module.css", "css_module_template")
  }
  
  if (confirm("Add tests?")) {
    create_file("Component.test.tsx", "component_test_template")
  }
  
  if (confirm("Add Storybook story?")) {
    create_file("Component.stories.tsx", "storybook_template")
  }
  
  // Generate main component
  create_file("Component.tsx", "react_component_template")
  create_file("index.ts", "component_index_template")
  
  ask("React component generated! Files created in current directory.")
}
```

### Database Schema Generator

Interactive schema design:

```stim
command db_schema {
  ask("What's the table/collection name?")
  wait_for_response()
  
  ask("Brief description of what this stores?")
  wait_for_response()
  
  // Fields
  adding_fields = true
  fields = []
  
  while (adding_fields) {
    ask("Field name?")
    wait_for_response()
    
    field_types = ["string", "number", "boolean", "date", "text", "json"]
    ask("Field type? Options: " + field_types.join(", "))
    wait_for_response()
    
    if (confirm("Required field?")) {
      ask("Field marked as required")
    }
    
    if (confirm("Add validation rules?")) {
      ask("Validation description?")
      wait_for_response()
    }
    
    if (!confirm("Add another field?")) {
      adding_fields = false
    }
  }
  
  // Relationships
  if (confirm("Any relationships to other tables?")) {
    ask("Describe the relationships:")
    wait_for_response()
  }
  
  // Indexes
  if (confirm("Add database indexes?")) {
    ask("Which fields should be indexed?")
    wait_for_response()
  }
  
  create_file("schema.sql", "sql_schema_template")
  create_file("migration.sql", "migration_template")
  
  ask("Database schema generated! Check schema.sql and migration.sql")
}
```

## Pattern Examples

### Configuration Wizard

Multi-step configuration setup:

```stim
command config_wizard {
  config = {}
  
  // Database setup
  if (confirm("Configure database?")) {
    db_types = ["PostgreSQL", "MySQL", "SQLite", "MongoDB"]
    ask("Database type? Options: " + db_types.join(", "))
    wait_for_response()
    
    ask("Database host/URL?")
    wait_for_response()
    
    if (confirm("Requires authentication?")) {
      ask("Username?")
      wait_for_response()
      ask("Password will be set via environment variable")
    }
  }
  
  // API configuration
  if (confirm("Configure external APIs?")) {
    ask("How many API integrations?")
    wait_for_response()
    
    // Could loop here based on count
    ask("API endpoint URLs and keys will be configured")
  }
  
  create_file("config.json", "configuration_template")
  create_file(".env.example", "env_template")
  
  ask("Configuration files generated!")
}
```

### Testing Strategy

Comprehensive testing setup:

```stim
command test_strategy {
  test_types = [
    "Unit tests",
    "Integration tests", 
    "End-to-end tests",
    "Performance tests",
    "Security tests"
  ]
  
  selected_types = []
  
  for test_type in test_types {
    if (confirm("Include " + test_type + "?")) {
      ask("Framework preference for " + test_type + "?")
      wait_for_response()
    }
  }
  
  if (confirm("Set up CI/CD pipeline?")) {
    ci_platforms = ["GitHub Actions", "GitLab CI", "CircleCI", "Travis CI"]
    ask("CI platform? Options: " + ci_platforms.join(", "))
    wait_for_response()
  }
  
  create_file("jest.config.js", "jest_config_template")
  create_file("cypress.config.js", "cypress_config_template") 
  create_file(".github/workflows/test.yml", "github_actions_template")
  
  ask("Testing strategy implemented! Check generated config files.")
}
```

## Tips for Creating Examples

### Structure Your Commands

1. **Setup phase**: Gather information and configuration
2. **Processing phase**: Make decisions and perform actions  
3. **Output phase**: Generate files and provide feedback

### Use Progressive Enhancement

Start with basic functionality, then add optional features:

```stim
command enhanced_example {
  // Core functionality
  ask("Basic required information")
  
  // Optional enhancements
  if (confirm("Add advanced features?")) {
    ask("Advanced configuration")
  }
  
  if (confirm("Generate additional files?")) {
    create_file("extra.txt", "bonus_content")
  }
}
```

### Provide Clear Feedback

Keep users informed about what's happening:

```stim
ask("Analyzing your requirements...")
wait_for_response()

ask("Generating project structure...")  
wait_for_response()

ask("✓ Project created! Next steps: run npm install")
```

---

**Want to contribute examples?** Submit a PR with your `.stim` command to help other developers!