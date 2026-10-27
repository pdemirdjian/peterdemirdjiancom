---
title: "Resume"
pdf: true
---

## Contact Info

{{< contact >}}

## Experience

### CarGurus, Inc

#### Principal DevOps Engineer <span class="dates">October 2024 – Present</span>

* Won CarGurus’ Pioneering Award for enabling organization-wide adoption of Claude Code through Amazon Bedrock. Subsequently joined the AIDLC team to help build the company’s agentic development platform.
* Built out staged infrastructure for an agentic engineering platform, improved CI-failure diagnosis for fix agents, and added OpenTelemetry instrumentation across serverless and container services.
* Architected a self-service infrastructure platform using HCP Terraform, AWS, and GitHub, governed by Sentinel Policy as Code to enable autonomous resource management.
* Championed AI-driven workflows to assist developers in generating compliant AWS code, removing centralized bottlenecks while ensuring safety and speed.
* Led the migration and adoption of HCP Terraform, delivering on strategic objectives and establishing the 2025 roadmap.
* Migrated AWS infrastructure from CDK to HCP Terraform, enabling GHES-connected workflows and tightening IAM scope.
* Designed and implemented a scalable artifact expiration strategy for Artifactory, creating Architectural Decision Records (ADRs) and gaining cross-team buy-in.
* Upgraded the Vault EKS clusters to Kubernetes 1.33 across lab and production regions, and moved service alert routing to Grafana IRM.
* Architected and executed the complete decommissioning of RabbitMQ from the environment.
* Spearheaded the Amazon Linux 2 (AL2) migration for Redis, identifying critical risks and executing seamless production maintenance.
* Rapidly re-architected site-homepage redirects to resolve critical time-sensitive dependencies for Product Engineering.
* Recognized as a primary troubleshooter for complex, cross-domain outages, rapidly orienting in unfamiliar systems to drive root cause resolution.
* Stepped up as interim lead during team transitions, ensuring critical Q2 objectives were met despite resourcing challenges.
* Volunteered as Scrum Leader for the Kubernetes team to bootstrap agile processes, unblocking sprint goals and facilitating organizational success.
* Acted as a technical mentor and "Coach" for the team, fostering a culture of knowledge sharing and elevating engineering standards.
* Contributed to organizational growth by serving on interview panels for partner companies (e.g., CarOffer).

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

* Migrated over 3000 Windows machines from Microsoft's Desired State Configuration to Puppet.
* Optimized Windows license placement, saving $3M in annual spend.
* Created complete configuration management roles and profiles within Puppet for Windows and Linux machines.
* Enabled application teams to self-service Puppet and Terraform configurations after consultation and design meetings.
* Designed and implemented a self-service Windows Update solution to enable developers to deploy updates on schedules that worked for them via Octopus Deploy.
* Designed, deployed, and maintained Octopus Deploy infrastructure for all .NET deployments.
* Built out Buildkite agent infrastructure, created Buildkite plugins, and contributed code to the open source Buildkite Agent.
* Reviewed and created Terraform configurations for virtual machines in a private data center.
* Monitored for and responded to critical events for over 3000 machines.
* Empowered teammates to learn the latest technologies (Puppet, Terraform) with careful reviews, constructive feedback, and peer-coding sessions.

#### IT Support Engineer <span class="dates">June 2016 – August 2017</span>

* Created a self-service Jenkins pipeline that allowed users to request software via System Center Configuration Manager that employed internal change control APIs to require manager approval to keep software licensing costs down and reduce ticket load for frontline IT members.
* Developed, maintained, and improved internal inventory system in PHP for tracking equipment in multiple locations.
* Managed users and computers through Active Directory, Group Policy, and System Center Configuration Manager with 7000+ users.
* Configured Linux virtual machines on various data center and office hypervisors to run the Casper Application to support Mac OS X in such a way that they conformed to company-maintained security policies.

#### IT Intern <span class="dates">January 2014 – June 2016</span>

* Imaged and configured workstations using SCCM for weekly new hire cohorts of 25–150 people, and prepared equipment and conference rooms (including a rebrand rollout).
* Wrote PowerShell scripts for automated IT, HR, and Facilities email reminders and automated routine IT functions for other IT staff, following code deployment processes.
* Resolved helpdesk tickets and maintained, installed, and repaired computer and network hardware.

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
