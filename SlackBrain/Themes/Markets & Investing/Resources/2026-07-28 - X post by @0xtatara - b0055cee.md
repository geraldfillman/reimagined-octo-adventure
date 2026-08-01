---
title: "X post by @0xtatara"
type: slack_capture
category: resource
theme: "Markets & Investing"
status: reference
created: 2026-07-28
captured: "2026-07-29T10:08:02-04:00"
source: slack
slack_source_id: "T0AK9JQE38F:C0AK9JQNT3R:1785270949.589979"
slack_workspace: "Dark_Tower"
slack_team_id: "T0AK9JQE38F"
slack_channel: "all-darktower"
slack_channel_id: "C0AK9JQNT3R"
slack_message_ts: "1785270949.589979"
slack_url: "https://darktowerworkspace.slack.com/archives/C0AK9JQNT3R/p1785270949589979"
author: "Roland"
tags:
  - "slackbrain"
  - "slack/resource"
  - "theme/markets-investing"
  - "source/x"
  - "creator/0xtatara"
  - "topic/quant-research"
  - "topic/backtesting"
  - "topic/market-data"
  - "overlap/ai-ml"
---

# X post by @0xtatara

## Summary

---
title: "The Quant Research Pipeline Nobody Explains."
source: "https://x.com/0xTatara/status/2078828967407026452?s=46"
author:
  - "[[@0xTatara]]"
published: 2026-07-19
created: 2026-07-29
description: "From raw market data to tradable alpha. The full process behind every real edge.Most people think quant research starts with a strategy idea..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HNl5wmwW4AATt3s?format=jpg&name=large)

## From raw market data to tradable alpha. The full process behind every real edge.

Most people think quant research starts with a strategy idea.

It usually starts much earlier.

Before the model. Before the backtest. Before the signal.

A real quant research pipeline begins with a question about the market that can survive contact with data.

Why does this price move exist?

Who is creating it?

How long does it last?

Can it be measured before everyone else measures it?

Can it still be traded after costs?

That is the part almost nobody explains.

People see the final strategy.

They see the Sharpe ratio.

They see the machine learning model.

They see the execution system.

What they do not see is the long pipeline that sits underneath all of it.

Raw data enters one side.

A tiny piece of tradable information comes out the other.

Almost everything in between gets rejected.

That rejection process is quant research.

## Alpha does not begin with a model

The easiest way to waste six months in quantitative trading is to start with the algorithm.

Open XGBoost.

Build a neural network.

Feed it ten years of price data.

Ask it to predict tomorrow.

This feels like research because the code is difficult.

But difficulty is not the same as edge.

The strongest quant research usually starts with a hypothesis about how markets actually behave.

Maybe large institutional orders create temporary price pressure.

Maybe investors react slowly to certain information.

Maybe two related assets occasionally diverge because liquidity disappears in one of them.

Maybe options dealers are forced to hedge in predictable ways when volatility moves.

Maybe an index rebalance creates mechanical demand that has nothing to do with fundamentals.

The first question is not:

Which model should I use?

It is:

What mechanism could create a repeatable inefficiency?

That distinction changes the entire pipeline.

If you begin with a model, you search the data for anything it can predict.

If you begin with a market mechanism, you search for evidence that the mechanism leaves a measurable footprint.

One approach produces patterns.

The other has a chance of producing alpha.

The model comes later.

Much later.

## Stage one: turn the market into data

Markets do not arrive as clean tables.

They arrive as trades.

Quotes.

Order book updates.

Corporate actions.

Economic releases.

News.

Options chains.

Funding rates.

Liquidations.

ETF flows.

Earnings transcripts.

Alternative datasets.

Millions of events happening on different clocks.

The first real problem in quant research is deciding what the market actually looked like at a specific moment in time.

That sounds simple until you try to build it.

Prices need to be adjusted correctly.

Delisted securities need to remain in historical datasets.

Timestamps need to match.

Missing values need to be understood, not blindly filled.

A macroeconomic number needs to reflect what traders knew when it was originally released, not the revised number available today.

An earnings report needs to appear in the dataset when it became public, not when the quarter ended.

At high frequency, even milliseconds matter.

A quote received after a trade cannot be used to explain the trade before it.

This is why institutional quant firms spend enormous effort on data infrastructure.

A sophisticated model trained on contaminated data is still a contaminated model.

Garbage does not become alpha because you passed it through a neural network.

The first edge is often simply knowing what actually happened.

![Image](https://pbs.twimg.com/media/HNl6zLDW0AAdoP6?format=jpg&name=large)

## Stage two: create the research universe

Before testing a signal, a quant needs to decide where the signal is allowed to exist.

This is the universe.

Maybe it is the largest 500 US equities.

Maybe it is every liquid futures contract.

Maybe it is crypto perpetuals above a minimum daily volume.

Maybe it is equity options with enough open interest.

This decision looks boring.

It is not.

Change the universe and you can completely change the result.

Suppose you test a stock strategy using only companies that exist today.

The bankrupt companies disappear.

The delisted companies disappear.

The businesses that collapsed disappear.

You have accidentally created a market where losers are deleted from history.

The backtest improves.

Reality does not.

Liquidity creates another problem.

A signal might look incredible across thousands of tiny stocks.

But if your strategy needs to buy $5 million of something that trades $200,000 per day, the signal does not exist at your size.

So the research universe is not just:

Where does this idea work?

It is:

Where could this idea actually be traded?

This is where quant research begins separating mathematical possibility from financial reality.

## Stage three: transform observations into features

Raw prices are rarely the final input.

Researchers transform market behavior into variables that models can understand.

Returns.

Volatility.

Volume imbalance.

Momentum.

Distance from a moving average.

Relative valuation.

Yield curve changes.

Option skew.

Funding rates.

Order flow.

Sentiment.

Cross-sectional rankings.

Residual returns.

These are features.

But feature engineering in finance is different from ordinary machine learning.

A normal ML problem often assumes that the relationship between input and output is relatively stable.

Finance does not give you that luxury.

A feature can work for five years and disappear.

It can reverse.

It can become crowded.

It can only work during high volatility.

It can only exist in small caps.

It can vanish the moment transaction costs increase.

This means every feature needs context.

Take momentum.

“Price went up” is not enough.

Over what horizon?

Relative to what?

The market?

The sector?

Its own historical volatility?

Was the move driven by one large jump or twenty gradual sessions?

Did volume confirm it?

Did the asset move independently or simply follow the entire market?

The same raw price series can generate dozens of different signals depending on how you frame the question.

That is why good quant research is often less about finding more data and more about representing the same data correctly.

The information was already there.

The feature makes it visible.

## Stage four: remove what you do not want to trade

One of the most powerful ideas in quantitative research is decomposition.

A stock moves three percent.

Retail sees a stock that moved three percent.

A quant asks where the three percent came from.

Maybe the entire market moved two percent.

Maybe the technology sector moved another half percent.

Maybe momentum factors explain another twenty basis points.

Maybe the stock's sensitivity to interest rates explains more.

After removing all of that, perhaps only thirty basis points remain unexplained.

That residual can be more interesting than the original three percent move.

Because the quant may not want to trade the market.

Or technology.

Or interest rates.

The quant wants the specific abnormal movement that remains after those exposures are removed.

This is the logic behind factor models and many forms of statistical arbitrage.

Start with the observed return.

Remove common components.

Study the leftover.

Sometimes the residual contains nothing.

Sometimes it contains temporary pressure.

Sometimes it identifies an asset that moved too far relative to everything that normally explains it.

The goal is not always to predict the entire price.

It is often to isolate the smallest part of the price that might be predictable.

That is a much easier problem.

## Stage five: turn the feature into a signal

A feature describes the market.

A signal tells the system what to do.

Those are not the same thing.

Suppose your research shows that unusually negative residual returns tend to reverse over the next two days.

You still do not have a strategy.

You need rules.

How negative is unusual?

Do you trade every event?

Only the extreme ones?

Do you rank the entire universe and buy the cheapest residuals?

Do you short the richest?

Do you hold for one day?

Two?

Five?

Do you scale positions by volatility?

Do you neutralize market exposure?

Sector exposure?

Beta?

Now the research becomes portfolio construction.

This is where many promising ideas disappear.

A signal can be statistically predictive and still produce a terrible portfolio.

Maybe all your long positions are technology stocks.

Maybe your supposedly market-neutral strategy secretly has massive beta.

Maybe ten different signals are actually the same momentum trade wearing different names.

Maybe your strongest positions appear in the least liquid assets.

The signal does not exist independently.

It lives inside a portfolio.

And the portfolio is what actually makes or loses money.

![Image](https://pbs.twimg.com/media/HNl6-oCWMAAE9z2?format=jpg&name=large)

## Stage six: ask whether the signal is real

This is where quant research becomes hostile.

A good researcher does not try to prove the signal works.

The researcher tries to destroy it.

Change the period.

Does it survive?

Change the universe.

Does it survive?

Shift the signal by one day.

Does it survive?

Use slightly different parameters.

Does it survive?

Remove the best-performing year.

Does it survive?

Increase transaction costs.

Does it survive?

Test another market.

Does it survive?

A weak research process asks:

How high is the Sharpe ratio?

A strong research process asks:

How difficult is it to make the Sharpe ratio disappear?

That is robustness.

A signal that only works with a 37-day lookback and dies at 35 or 40 is suspicious.

A signal that works at 30, 40, 50, and 60 days with different levels of strength is more interesting.

The goal is not to find the perfect parameter.

Perfect parameters usually belong to the past.

The goal is to identify a region where the economic effect appears consistently.

Real alpha should bend.

It should not instantly break.

![Image](https://pbs.twimg.com/media/HNl7F-_XEAABVZr?format=jpg&name=large)

## Stage seven: separate discovery from verification

This is one of the most important pieces of the pipeline.

The same process that discovers a strategy should not be trusted to validate it.

Why?

Because research creates attachment.

You spent three weeks on the signal.

You understand the theory.

You wrote the code.

You saw the beautiful backtest.

You want it to work.

That makes you dangerous.

Quant firms solve this by separating creation from verification.

The researcher produces the idea.

Another process attacks it.

Check the data.

Check the assumptions.

Check the statistics.

Check the exposure.

Check for leakage.

Check whether the result survives out-of-sample.

The maker asks:

Can this be alpha?

The checker asks:

How is this lying to us?

Both are necessary.

This becomes even more important when automation enters the pipeline.

A system can generate hundreds of research hypotheses.

Another process can write the code.

Another can optimize parameters.

The speed of discovery becomes almost unlimited.

But faster discovery also means faster production of false positives.

If you can test one thousand times more strategies, your verification system needs to become one thousand times more skeptical.

Automation does not remove the scientific method.

It makes the scientific method more important.

## Stage eight: simulate the trade, not the signal

This is where academic alpha meets the actual market.

Your signal says buy.

At what price?

That question can kill the entire strategy.

The backtest assumes you traded at the close.

Could you actually have traded at the close?

Did the information used by the signal arrive before the closing auction?

How much volume was available?

Would your order move the market?

Would you cross the spread?

Would the fill happen immediately?

Would the signal decay while the order was executing?

Execution is not a small adjustment added after research.

For many strategies, execution is part of the research.

Suppose a signal predicts ten basis points of return.

If trading costs eight basis points, you have a weak strategy.

If trading costs twelve, you have no strategy.

At high frequency, the raw alpha can be almost invisible.

A few basis points.

Sometimes less.

The entire business depends on extracting that edge without destroying it.

This is why two firms can discover the same signal and produce completely different returns.

One has better execution.

The signal is public.

The implementation is the moat.

## Stage nine: size the edge

Even after finding a genuine signal, one question remains.

How much should you bet?

This is where prediction becomes risk.

A signal can be profitable and still destroy the portfolio if sized incorrectly.

Expected return matters.

But so does volatility.

Correlation.

Drawdown.

Tail risk.

Liquidity.

Capacity.

A strategy with high expected return and extreme downside risk may deserve less capital than a weaker but more stable strategy.

Multiple signals also interact.

Five independent edges can create a strong portfolio.

Five highly correlated edges can create one giant hidden bet.

Position sizing turns research into a capital allocation problem.

The question is no longer:

Is this trade good?

It becomes:

How much capital should this edge receive relative to every other edge we have?

That is a completely different level of thinking.

The strategy is not competing against cash.

It is competing against every other possible use of capital.

## Stage ten: production is another research experiment

The biggest mistake is thinking the pipeline ends when the strategy goes live.

That is when the most valuable dataset begins.

Live performance.

Now you can compare the real strategy with the simulated one.

Expected slippage versus actual slippage.

Expected fills versus actual fills.

Expected turnover versus actual turnover.

Expected alpha decay versus actual decay.

The difference between simulation and production contains information.

Maybe the signal is correct but execution is poor.

Maybe market impact was underestimated.

Maybe the strategy performs differently at certain times of day.

Maybe one venue consistently produces worse fills.

Maybe the alpha disappears faster than expected.

Maybe the backtest assumed liquidity that never actually existed.

Production generates feedback.

That feedback returns to research.

The pipeline becomes a loop.

Data.

Hypothesis.

Feature.

Signal.

Validation.

Portfolio.

Execution.

Monitoring.

Feedback.

Then back to data.

The quant system is not a collection of strategies.

It is a machine for continuously testing reality.

![Image](https://pbs.twimg.com/media/HNl7So-XoAA7SwJ?format=jpg&name=large)

## Most research ideas should die

This is the part nobody likes to talk about.

A healthy quant research pipeline destroys most ideas.

You might start with one hundred hypotheses.

Fifty show no statistical relationship.

Twenty work only during one historical period.

Ten disappear after fixing data leakage.

Eight die after transaction costs.

Five collapse out-of-sample.

Four are too correlated with strategies already in the portfolio.

Two have insufficient capacity.

One survives.

That one might not even be spectacular.

Maybe the Sharpe ratio is 1.1.

Maybe the edge is only a few basis points.

Maybe it works only in one small corner of the market.

That is fine.

The purpose of the pipeline was never to make every idea work.

The purpose was to prevent bad ideas from reaching capital.

A quant firm with great researchers and a weak rejection process can still lose money.

A firm with a strong research pipeline can survive thousands of failed experiments.

Failure becomes cheap.

That is the advantage.

## The real moat is the pipeline

People obsess over secret algorithms.

The hidden indicator.

The magical model.

The system that predicts markets.

That is usually the wrong place to look.

Individual signals decay.

Strategies get crowded.

Data becomes available to competitors.

Models become open source.

What survives is the system around them.

How quickly can you test a new hypothesis?

How clean is your data?

How aggressively do you reject false discoveries?

How accurately can you simulate execution?

How quickly do you detect signal decay?

How safely can you deploy new strategies?

How much knowledge from failed research gets preserved?

This is the real compounding mechanism.

One strategy can die.

The pipeline produces another.

One data source loses value.

The pipeline evaluates a new one.

One market becomes too competitive.

The research moves somewhere else.

The permanent edge is not always the alpha itself.

The permanent edge is the ability to keep finding, testing, deploying, and killing alpha faster than everyone else.

## What quant research actually looks like

It is less glamorous than people imagine.

Most days are not spent discovering billion-dollar strategies.

They are spent cleaning data.

Debugging timestamps.

Questioning suspicious results.

Finding hidden exposures.

Watching promising ideas disappear after costs.

Rejecting models.

Rebuilding tests.

Comparing live performance with simulation.

The final strategy may look simple.

The process that allowed you to trust it is not.

That is the part outsiders never see.

They see one equation.

One model.

One trading bot.

Underneath it is an entire research architecture built around one principle:

Do not let randomness reach capital.

## The final reframe

Quant research is not a search for predictions.

It is a filtration system.

The market produces an almost infinite amount of noise.

The pipeline removes pieces of it.

First bad data.

Then meaningless patterns.

Then common risk.

Then unstable signals.

Then statistical accidents.

Then strategies that cannot survive costs.

Then strategies that cannot scale.

Then strategies that fail in production.

What remains is usually small.

A few basis points.

A weak statistical tendency.

A temporary inefficiency.

Something most people would ignore.

But if it is real.

If it survives verification.

If it survives execution.

If it can be sized safely.

If it can be repeated.

Then that small piece becomes alpha.

The model was never the whole game.

The backtest was never the whole game.

The signal was never the whole game.

The pipeline is the game.

Because the best quant firms are not better at predicting the future once.

They are better at building systems that continuously separate what is real from what only looks real.

And in a market made almost entirely of noise, that may be the most valuable edge of all.
## Original Slack note

<https://x.com/0xtatara/status/2078828967407026452?s=46|https://x.com/0xtatara/status/2078828967407026452?s=46>

## Links

- [Open X post by @0xtatara](<https://x.com/0xtatara/status/2078828967407026452?s=46>)

## Connections

- [[2026-07-28 - Combine fundamentals, sentiment, and price in a Python backtest - 9f44aec2|Fundamentals, sentiment, and price backtest]] — a concrete implementation lane for the broader research pipeline.
- [[2026-07-28 - X post by @rohonchain - 1252b22f|Black–Scholes and volatility risk premium]] — a domain-specific example of mechanism-first modeling, robustness, and real trading frictions.
- [[2026-07-28 - X post by @cyrilxbt - 15b8392b|Graph engineering for agents]] — parallels the use of explicit stages, verification, and bounded failure handling.

## Provenance

- Workspace: Dark_Tower
- Channel: all-darktower
- Author: Roland
- Slack timestamp: 1785270949.589979
- [Open original Slack message](<https://darktowerworkspace.slack.com/archives/C0AK9JQNT3R/p1785270949589979>)
