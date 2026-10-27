---
title: "Resume"
pdf: true
---

## Contact Info

{{< contact >}}

## Experience

### CarGurus, Inc

#### Principal DevOps Engineer <span class="dates">October 2024 – Present</span>

* Won CarGurus’ Pioneering Award for leading organization-wide adoption of Claude Code through Amazon Bedrock (287 engineers onboarded by April): a shared access model, Terraform-managed per-user inference profiles, and usage-cost visibility in CloudZero. Continue to own organization-wide Bedrock model enablement, most recently shipping a new model three days after its public launch.
* Selected for the AIDLC tiger team in May 2026 on the strength of the Claude Code initiative.
* On the AIDLC team, help build delivery infrastructure for Mauve, CarGurus’ agentic development platform: Terraform-managed delivery paths and an approval-gated, CodeBuild-backed CircleCI production lane (cutover in progress).
* Architected a self-service infrastructure platform using HCP Terraform, AWS, and GitHub, governed by Sentinel Policy as Code; the platform cut active provisioning effort by about 80% and grew managed resources from about 92 to 197 in development and 73 to 204 in production over two months (team results).
* Presented Semgrep IAM checks at the CarGurus Science Fair that run as Claude Code writes Terraform, moving policy feedback ahead of late-stage failures and overrides.
* Championed AI-driven workflows to assist developers in generating compliant AWS code, removing centralized bottlenecks while ensuring safety and speed.
* Led the migration and adoption of HCP Terraform and established the 2025 roadmap; now moving AWS infrastructure off CDK and connecting HCP Terraform to GitHub Enterprise Server.
* Designed and implemented a scalable artifact expiration strategy for Artifactory, creating Architectural Decision Records (ADRs) and gaining cross-team buy-in.
* Architected and executed the complete decommissioning of RabbitMQ from the environment.
* Spearheaded the Amazon Linux 2 (AL2) migration for Redis, identifying critical risks and executing seamless production maintenance.
* Upgraded the Vault EKS clusters to Kubernetes 1.33 across lab and production regions, moved Mauve alert routing to Grafana IRM, and improved ECS cost attribution.
* Rapidly re-architected site-homepage redirects to resolve critical time-sensitive dependencies for Product Engineering.
* Recognized as a primary troubleshooter for complex, cross-domain outages, rapidly orienting in unfamiliar systems to drive root cause resolution.
* Stepped up as interim lead during team transitions, ensuring critical Q2 objectives were met despite resourcing challenges.
* Served as Scrum Leader for the Kubernetes team and as a technical mentor and coach, raising engineering standards through knowledge sharing.

#### Senior DevOps Engineer <span class="dates">January 2022 – October 2024</span>

* Stabilized and optimized Concourse CI/CD by architecting a graceful node retirement process and implementing autoscaling with spot instances, saving ~$30k/month.
* Implemented S3 Lifecycle policies for Snowplow and Static assets, resulting in combined savings of over $28k/month.
* Overhauled HAProxy stack by removing legacy Ruby templating, adding canary load balancers, and enabling traffic mirroring.
* Migrated Jenkins from on-premise data centers to AWS, auditing and retiring legacy jobs.
* Took initiative on the unplanned, high-priority Cyera data discovery project, leading the effort across teams and managing vendor relations to completion under tight timelines.
* Championed a collaborative culture by actively onboarding and mentoring new hires, significantly accelerating their ramp-up time on complex systems.
* Drove architectural consensus by authoring RFCs and documentation (e.g., Concourse improvement plan), ensuring knowledge transfer and democratizing decisions.

### Wayfair LLC

#### Senior Cloud Engineer <span class="dates">October 2020 – January 2022</span>

* Consulted with developer teams to drive cloud adoption and migration from our on-premises data center.
* Developed Terraform modules to enable and accelerate features available in Open Source Terraform and Terraform Enterprise.
* Extended our Google Compute Engine image pipeline so engineers could update running instances without downtime and with greater confidence.
* Integrated Terraform Enterprise modules with Backstage for self-service developer infrastructure.
* Created a team Golang utility to assist with troubleshooting, day-to-day operations, and on-call support.
* Deployed Datadog monitoring scripts for observability into our most critical cloud resources running the storefront.

#### Senior Site Reliability Engineer <span class="dates">August 2017 – October 2020</span>

* Migrated over 3000 Windows machines from Microsoft's Desired State Configuration to Puppet, building complete roles and profiles for Windows and Linux.
* Optimized Windows license placement, saving $3M in annual spend.
* Enabled application teams to self-service Puppet and Terraform configurations after consultation and design meetings.
* Designed and implemented a self-service Windows Update solution to enable developers to deploy updates on schedules that worked for them via Octopus Deploy.
* Designed, deployed, and maintained Octopus Deploy infrastructure for all .NET deployments.
* Built out Buildkite agent infrastructure, created Buildkite plugins, and contributed code to the open source Buildkite Agent.
* Empowered teammates to learn the latest technologies (Puppet, Terraform) with careful reviews, constructive feedback, and peer-coding sessions.

#### IT Support Engineer <span class="dates">June 2016 – August 2017</span>

* Built a self-service Jenkins pipeline for SCCM software requests with manager approval through internal change-control APIs, cutting licensing costs and frontline ticket load.
* Managed 7000+ users and computers through Active Directory, Group Policy, and SCCM, and maintained an internal PHP inventory system.

#### IT Intern <span class="dates">January 2014 – June 2016</span>

* Imaged workstations with SCCM for weekly new-hire cohorts of 25–150, wrote PowerShell automation for IT, HR, and Facilities, and resolved helpdesk tickets.

## Skills

* **Cloud, Orchestration & Observability:** AWS (EC2, S3, Redis, IAM), GCP, Kubernetes (EKS), Nomad, OpenTelemetry, Grafana IRM
* **Infrastructure as Code:** Self-Service Infrastructure Platform Design, HCP Terraform, Terraform, Sentinel (Policy as Code), Puppet, Packer, Consul
* **CI/CD & DevEx:** AI-Assisted Infrastructure Development, Concourse CI/CD, Jenkins, GitHub Actions, CircleCI, Artifactory, Buildkite, Octopus Deploy
* **Networking & Security:** HAProxy (Canary LBs, Traffic Mirroring), Cyera (Data Discovery), SSL/TLS Management
* **Programming & Automation:** Golang, Python, PowerShell, PHP, Ruby, SQL
* **Leadership & Strategy:** Cloud Enablement, Agile/Scrum (Scrum Leader), RFC/ADR Authoring, Mentorship & Coaching, Cost Optimization, Vendor Management

## Selected Projects & Open Source

{{< projects >}}

## Education

### Northeastern University <span class="dates">August 2018</span>

* Bachelor of Science, Business Administration, Computer Science (Minor) — Boston, MA
