import { ResumeData } from '../types/resumeBuilder';

export const AI_SKILL_RECOMMENDATIONS: Record<string, string[]> = {
  'java': [
    'Java 21', 'Spring Boot 3', 'Microservices', 'Hibernate', 'RESTful APIs',
    'MySQL', 'PostgreSQL', 'Kafka', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'JUnit 5', 'CI/CD'
  ],
  'full stack': [
    'React.js', 'TypeScript', 'Node.js', 'Spring Boot', 'Tailwind CSS',
    'PostgreSQL', 'Docker', 'GraphQL', 'Next.js', 'REST APIs', 'Git', 'AWS'
  ],
  'frontend': [
    'React.js', 'TypeScript', 'Next.js', 'JavaScript (ES6+)', 'Tailwind CSS',
    'Redux Toolkit', 'HTML5/CSS3', 'Webpack/Vite', 'RESTful APIs', 'Jest', 'UI/UX Design'
  ],
  'backend': [
    'Java', 'Spring Boot', 'Python', 'Go', 'Microservices Architecture',
    'PostgreSQL', 'MongoDB', 'Redis', 'Apache Kafka', 'Docker', 'Kubernetes', 'gRPC'
  ],
  'devops': [
    'Kubernetes', 'Docker', 'Terraform', 'AWS', 'GitHub Actions',
    'Jenkins', 'Prometheus', 'Grafana', 'Linux', 'Ansible', 'ArgoCD', 'Bash Scripting'
  ],
  'data': [
    'Python', 'SQL', 'Apache Spark', 'Pandas', 'PyTorch',
    'Snowflake', 'Airflow', 'Tableau', 'Scikit-Learn', 'AWS Glue', 'BigQuery'
  ],
  'default': [
    'Java', 'Spring Boot', 'React.js', 'TypeScript', 'MySQL',
    'Docker', 'AWS', 'REST APIs', 'Git', 'Agile/Scrum', 'CI/CD Pipelines'
  ]
};

export const AI_SUMMARY_TEMPLATES: Record<string, string[]> = {
  'technical': [
    'High-performing {ROLE} with {YEARS} of experience architecting resilient cloud-native architectures and high-throughput microservices. Proven track record of boosting system reliability by 40% while accelerating sprint velocity across cross-functional engineering squads.',
    'Innovative {ROLE} specializing in full lifecycle software engineering, distributed systems, and modern web application development. Passionate about clean architecture, test automation, and building scalable enterprise platforms serving millions of concurrent users.',
    'Results-driven {ROLE} adept at translating complex business requirements into elegant, high-concurrency technical solutions. Recognized for optimizing database queries, eliminating latency bottlenecks, and driving CI/CD automation.'
  ],
  'executive': [
    'Strategic engineering professional with {YEARS} as a {ROLE}, directing end-to-end product architecture and high-velocity talent squads. Proven ability to align engineering roadmaps with revenue-critical business outcomes while mentoring top-tier engineers.',
    'Visionary {ROLE} offering deep expertise in modern tech stacks, distributed platforms, and agile delivery. Led transformation initiatives that reduced cloud infrastructure expenditure by 30% while maintaining 99.99% uptime SLAs.'
  ],
  'creative': [
    'Dynamic {ROLE} dedicated to crafting performant, accessible, and user-centric digital products. Combines strong engineering fundamentals with an eye for pixel-perfect design, modern motion principles, and intuitive user workflows.'
  ]
};

export const AI_BULLET_TRANSFORMERS: { trigger: RegExp; result: string }[] = [
  {
    trigger: /api|backend|endpoint/i,
    result: 'Architected and deployed high-performance RESTful APIs in Spring Boot handling 20,000+ daily requests with <80ms p95 latency.'
  },
  {
    trigger: /database|sql|mysql|mongo|query/i,
    result: 'Optimized relational schema indexing and query performance, reducing complex transaction response times by 45%.'
  },
  {
    trigger: /frontend|ui|react|page/i,
    result: 'Engineered responsive, accessible React/TypeScript user interfaces with reusable design system components, improving core web vitals by 35%.'
  },
  {
    trigger: /docker|k8s|cloud|deploy|aws/i,
    result: 'Containerized microservices and automated zero-downtime deployment pipelines using Docker, Kubernetes, and GitHub Actions.'
  },
  {
    trigger: /test|junit|quality/i,
    result: 'Implemented rigorous unit and integration test coverage exceeding 85% using JUnit 5 and Mockito, reducing post-release production defects by 30%.'
  },
  {
    trigger: /team|agile|lead/i,
    result: 'Spearheaded sprint grooming and technical design reviews, collaborating closely with product managers to deliver features 2 weeks ahead of target schedule.'
  }
];

export function generateAISummary(role: string, years?: string, tone: 'technical' | 'executive' | 'creative' = 'technical'): string {
  const cleanRole = role.trim() || 'Software Engineer';
  const cleanYears = years && years.trim() ? years.trim() : '3+ years';

  const toneTemplates = AI_SUMMARY_TEMPLATES[tone] || AI_SUMMARY_TEMPLATES['technical'];
  const template = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

  return template
    .replace(/{ROLE}/g, cleanRole)
    .replace(/{YEARS}/g, cleanYears);
}

export function enhanceAIBullet(rawInput: string, _role?: string): string {
  if (!rawInput || rawInput.trim().length === 0) {
    return 'Spearheaded engineering initiatives and developed production features adhering to clean code and test-driven development practices.';
  }

  for (const item of AI_BULLET_TRANSFORMERS) {
    if (item.trigger.test(rawInput)) {
      return item.result;
    }
  }

  // Generic AI polish
  const clean = rawInput.trim();
  const firstWord = clean.split(' ')[0].toLowerCase();
  const verbs = ['Architected', 'Spearheaded', 'Engineered', 'Optimized', 'Streamlined', 'Delivered'];
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

  if (['worked', 'did', 'made', 'helped', 'built', 'created'].includes(firstWord)) {
    return `${randomVerb} ${clean.substring(firstWord.length).trim()}, resulting in enhanced system performance and operational reliability.`;
  }

  return `${randomVerb} ${clean}, driving measurable efficiency gains and scalability across enterprise systems.`;
}

export function suggestAISkills(role: string): string[] {
  const lower = role.toLowerCase();
  for (const [key, skills] of Object.entries(AI_SKILL_RECOMMENDATIONS)) {
    if (lower.includes(key)) {
      return skills;
    }
  }
  return AI_SKILL_RECOMMENDATIONS['default'];
}

export function getSampleResumeData(): ResumeData {
  return {
    templateId: 'modern',
    accentColor: '#0284c7',
    personalInfo: {
      fullName: 'Aarav Patel',
      targetRole: 'Senior Full Stack Java Engineer',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, Karnataka, India',
      linkedinUrl: 'https://linkedin.com/in/aarav-patel-dev',
      githubUrl: 'https://github.com/aaravpatel',
      portfolioUrl: 'https://aaravpatel.dev'
    },
    summary: 'High-performing Senior Full Stack Java Engineer with 4+ years of experience architecting resilient cloud-native architectures, high-throughput microservices, and reactive web applications. Proven track record of boosting system reliability by 40% while accelerating sprint velocity across cross-functional engineering squads.',
    experiences: [
      {
        id: 'exp-1',
        company: 'CloudScale Technologies Pvt Ltd',
        role: 'Senior Full Stack Developer',
        location: 'Bengaluru, India',
        startDate: 'Jan 2023',
        endDate: 'Present',
        current: true,
        highlights: [
          'Architected high-throughput microservices using Spring Boot 3 & MySQL, processing 50,000+ daily transactions with <90ms latency.',
          'Spearheaded the development of a real-time reactive dashboard in React.js and TypeScript, reducing user task completion times by 35%.',
          'Engineered end-to-end CI/CD automated deployment pipelines utilizing Docker, Kubernetes, and GitHub Actions, cutting release cycles from bi-weekly to daily.'
        ]
      },
      {
        id: 'exp-2',
        company: 'Apex Global Solutions',
        role: 'Java Software Engineer',
        location: 'Hyderabad, India',
        startDate: 'Jun 2021',
        endDate: 'Dec 2022',
        current: false,
        highlights: [
          'Engineered secure JWT token-based authentication services with stateless Spring Security filters.',
          'Optimized database indexes and query performance in MySQL, slashing database CPU utilization by 40%.',
          'Mentored 4 junior engineers on clean architecture principles and test-driven development (TDD) with JUnit 5.'
        ]
      }
    ],
    educations: [
      {
        id: 'edu-1',
        institution: 'National Institute of Technology (NIT)',
        degree: 'Bachelor of Technology (B.Tech)',
        fieldOfStudy: 'Computer Science & Engineering',
        startYear: '2017',
        endYear: '2021',
        grade: '8.8 / 10 CGPA'
      }
    ],
    skills: [
      'Java 21', 'Spring Boot 3', 'Microservices', 'React.js', 'TypeScript',
      'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'RESTful APIs', 'JUnit 5'
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'TalentFlow 360 - ATS Platform',
        role: 'Lead Architect',
        technologies: ['Spring Boot', 'React', 'TypeScript', 'MySQL'],
        description: 'Engineered an intelligent enterprise recruitment management system featuring 10-stage ATS pipelines, real-time interview scheduling with Google Meet, and dynamic candidate scoring.',
        link: 'https://github.com/aaravpatel/talentflow-360'
      }
    ],
    certifications: [
      'AWS Certified Solutions Architect - Associate',
      'Oracle Certified Professional: Java SE 17 Developer'
    ],
    totalExperienceYears: '4+ Years',
    currentNoticePeriod: 'Immediate / 15 Days'
  };
}
