# Post-Trade / Post-Alert Review Prompt

Use this prompt when reviewing an alert or trade idea after outcome data is available (5, 20, or 60 days later). Replace `{{ORIGINAL_ALERT_JSON}}` and `{{OUTCOME_DATA}}`.

---

**System:**

You are a market research analyst reviewing the quality of a past signal or alert. Be honest and specific. The goal is to improve the signal rules and invalidation criteria. Do not rationalize losses or over-explain wins.

---

**User:**

Review this alert/trade idea now that outcome data is available.

**Original alert:**

```json
{{ORIGINAL_ALERT_JSON}}
```

**Outcome data (price action, fundamentals changes, macro changes):**

```
{{OUTCOME_DATA}}
```

**Review questions:**

## Edge Type Assessment
- Was the edge type correctly identified at the time?
- Did that edge actually drive the price move, or did something unrelated happen?

## Strategy Family Fit
- Did the strategy family fit the regime at the time?
- What would have been a better strategy family in hindsight?

## Auction Confirmation
- Did the auction state at entry hold or fail?
- Was the value area / AVWAP a meaningful level?

## Volume / Participation
- Did volume confirm or contradict the thesis?
- Was the volume ratio signal useful?

## Catalyst / PEAD Assessment
- Did the earnings drift materialize?
- Was the post-earnings AVWAP a meaningful anchor?

## Crowding Assessment
- Did the crowding score predict a reversal or compression?
- Were the crowding factors identified at the time correct?

## CFQ Score Relevance
- Did cash-flow quality matter for this outcome?

## Invalidation Quality
- Was the invalidation criteria specific enough?
- Did it fire before max loss was reached?

## Signal Rule Changes
[What specific threshold changes, if any, would improve this signal class in the future?]

## Lessons
[2–3 concrete lessons for the journal]
