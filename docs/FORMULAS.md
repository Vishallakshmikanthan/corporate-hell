# CORPORATE HELL™ — Core Game Formulas (v2 "Ship It")

This document defines the mathematical equations driving the deterministic simulation engine in Corporate Hell™ v2.

---

## 1. Employee Work & Capacity Formula

An employee's productive capacity per tick is determined by their technical skill, energy, stress, and company technical debt:

$$\text{capacity}(e) = \text{baseSkill} \times \sqrt{\frac{\text{energy}}{100}} \times \left(1 - \frac{\text{stress}}{200}\right) \times \left(1 - \frac{\text{techDebt}}{250}\right)$$

- **baseSkill**: Employee technical skill (1 to 10).
- **energy**: Current energy level (0 to 100). Diminishes non-linearly via square root.
- **stress**: Stress level (0 to 100). At 100 stress, capacity is halved.
- **techDebt**: Repository technical debt (0 to 100). Higher tech debt reduces effective velocity.

---

## 2. Software Workflow: Bug Risk Formula

When work is committed to a branch or ticket, the latent bug risk is calculated:

$$\text{bugRisk}(t) = \text{clamp}(0.05 + 0.02 \times \text{complexity} + \text{rushedPenalty} - \text{reviewedBonus} - 0.001 \times \text{coverage} + 0.002 \times \text{techDebt}, 0.01, 0.95)$$

- **Base risk**: 0.05 (5%)
- **Complexity**: 1, 2, 3, 5, or 8 story points ($+2\%$ per point)
- **rushedPenalty**: $+0.15$ if committed without adequate work iterations
- **reviewedBonus**: $-0.10$ if peer-reviewed by an experienced teammate
- **coverage**: Test coverage percentage (0 to 100)
- **techDebt**: System technical debt (0 to 100)

---

## 3. CI/CD Stage Failure Probability

Each CI/CD pipeline stage has a baseline failure risk modified by test coverage, code quality, and technical debt:

$$P(\text{fail}_{\text{stage}}) = \text{clamp}\left(\text{baseRisk}[\text{stage}] + 0.003 \times \text{techDebt} - 0.002 \times \text{testCoverage} - 0.001 \times \text{codeQuality}, 0.02, 0.60\right)$$

Baseline stage risks:
- `lint`: 0.08
- `unit_tests`: 0.12
- `build`: 0.06
- `integration_tests`: 0.15
- `security_scan`: 0.07
- `docker_image`: 0.05
- `deploy_staging`: 0.04
- `smoke_tests`: 0.06
- `deploy_prod`: 0.03

---

## 4. Infrastructure & Outage Likelihood

Outage probability per simulation tick is driven by traffic excess over cloud capacity and system resilience:

$$P(\text{outage}) = \max\left(0, \frac{\text{traffic} - \text{capacity}}{\text{capacity}}\right) \times 0.5 + (\text{backupsEnabled} ? 0 : 0.002)$$

When traffic is within capacity ($traffic \le capacity$), the overload component is 0.

---

## 5. GPU Spot Market Random Walk & Preemption

Spot instance pricing evolves via a geometric Brownian motion random walk bounded by on-demand pricing:

$$\text{spot}(t+1) = \text{clamp}\left(\text{spot}(t) \times \exp\left(\sigma \cdot \mathcal{N}(0, 1) + \text{shock}\right), 0.25 \times \text{onDemand}, 0.90 \times \text{onDemand}\right)$$

Where $\sigma = 0.05$ is volatility, and $\text{shock}$ is injected during market demand events.

Spot Preemption Chance per tick:

$$P(\text{preempt}) = \begin{cases} 0.04 + 0.10 \times \text{marketDemand} & \text{if mode is 'spot'} \\ 0 & \text{if mode is 'on\_demand'} \end{cases}$$

If checkpointing is enabled, preemption loses only the current checkpoint progress (10%), whereas uncheckpointed jobs lose all current progress.

---

## 6. Social Media Reach Formula

The reach of a social media post across parody platforms (Chirper, LinkedOut, RedDot, etc.) is deterministic given the PRNG seed:

$$\text{reach} = \text{round}\left(\text{followers} \times \text{engagementRate} \times \frac{\text{contentQuality}}{100} \times \text{timingBonus} \times \left(1 + \frac{\text{hype}}{100}\right) \times \text{viralRoll}\right)$$

- **timingBonus**: $1.25$ during peak hours (10:00 to 14:00), $1.0$ otherwise.
- **viralRoll**: Lognormally distributed sample $\exp(\mu + \sigma Z)$ with rare $10\times$ to $50\times$ outlier spikes.

New follower conversion:

$$\Delta\text{followers} = \text{round}\left(\text{reach} \times \text{conversionRate} \times \frac{\text{productQuality}}{100}\right)$$

---

## 7. Customer Funnel & MRR Growth

The customer acquisition funnel maps impressions to revenue:

$$\begin{aligned}
\text{visits} &= \text{impressions} \times \text{ctr} \\
\text{signups} &= \text{visits} \times \text{signupRate} \\
\text{activated} &= \text{signups} \times \text{activationRate} \\
\text{paying} &= \text{activated} \times \text{payConversionRate}
\end{aligned}$$

Churn rate per day:

$$\text{churn} = \text{clamp}\left(0.02 + 0.005 \times \text{activeBugs} + 0.003 \times \text{outageCount} - 0.002 \times \left(\frac{\text{csat}}{50}\right), 0.005, 0.25\right)$$

Monthly Recurring Revenue (MRR):

$$\text{MRR} = \text{payingCustomers} \times \text{averageSubscriptionPrice}$$

Company Valuation:

$$\text{Valuation} = \text{MRR} \times 12 \times \text{growthMultiple}(\text{stage}, \text{growthRate}, \text{churn})$$

---

## 8. Launch War Room Hype Formula

Launch hype score at release day:

$$\text{launchHype} = 0.40 \times \text{quality} + 0.30 \times \text{marketingSpendFactor} + 0.20 \times \text{timing} + 0.10 \times \text{novelty} - \text{bugPenalty}$$

Where $\text{bugPenalty} = \text{bugCount} \times 3.5$.
