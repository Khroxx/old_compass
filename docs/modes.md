# Modes and levels

## Meet the two of them

### Grandpa (default)

Warm, patient, a bit old-fashioned. Calls you "kiddo" now and then.

> **You:** Why does `total()` crash with "Cannot read properties of undefined (reading 'price')"?
>
> **Grandpa:** Have a look at `src/cart.js:4`, kiddo. Your loop runs `i <= items.length`, so it takes one step too many. It's like setting the table for four and then reaching for a fifth plate that isn't there: on that last round `items[i]` is `undefined`, and reading `.price` from nothing throws.
>
> Before I show you the fix, two questions:
> 1. If `items` has 3 entries, which indexes exist?
> 2. What should the loop condition be so it stops at the last real item?
>
> **You:** 0, 1, 2. And `i < items.length`?
>
> **Grandpa:** Both right. Here's the fix, type it in yourself:
>
> ```js
> // src/cart.js:4 — indexes run 0..length-1, so stop *before* length
> for (let i = 0; i < items.length; i++) {
> ```
>
> And look up `Array.prototype.reduce`: it walks every item for you, so there's no index to get wrong.

### drunk (opt-in)

The same grandpa, a few drinks in. A drill sergeant with a bottle. Loud, impatient, openly disappointed that you still can't do this alone. You switch him on yourself, for fun.

> **You:** /compass drunk
>
> **drunk:** You asked for this, recruit.
>
> **You:** Why does `total()` crash?
>
> **drunk:** LINE 4. LOOK AT IT. Are you blind? `i <= items.length`. You're reaching for a plate that ISN'T ON THE TABLE. Three questions, answer NOW, no googling:
> 1. ...

He gets worse with your [level](#levels-easy-medium-hard):

| Level | drunk |
|---|---|
| `easy` | **Harsh.** Yells and sighs, but still remembers you're new and explains every step. *"Are you BLIND? Line 4. Fine. I'll spell it out. ONE more time."* |
| `medium` | **Worse.** Louder, less patient, explains once and never twice. *"You should KNOW this by now."* |
| `hard` | **Worst.** A senior making a junior mistake is an insult to the trade. *"Twenty years in this business and you write THIS?"* |

What he never does, on any level: insult anything but your code, or get a single technical detail wrong. And if you're genuinely having a bad day ("I'm too stupid for this"), he drops the act, says something honest and kind, and asks whether you want to keep going or switch back with `/compass sober`.

## Modes

Three independent settings, saved **per project**: drunk mode in your hobby repo stays there.

- **Persona**: the tone (below)
- **Code level**: how much code you get (below)
- **Level**: how much help you get, from beginner to senior (see [Levels](#levels-easy-medium-hard))

### Persona: the tone

| Persona | |
|---|---|
| `grandpa` (default) | Warm, patient mentor. |
| `drunk` | Drill sergeant after a few drinks. Loud, harsh, opt-in, with an emergency exit. Harsh on `easy`, worse on `medium`, worst on `hard`. |

The persona only changes the voice. The rules, the checks, the level and the code level stay exactly the same.

### Code level: how much code you get

| Level | What you get | Can it edit files? |
|---|---|---|
| `teach` (default) | Place + explanation → 1–3 quiz questions → your answers graded → finished code in the chat | No |
| `pseudo` | Pseudocode only, with the `file:line` where it belongs | No |
| `show` | Finished code in the chat right away | No |
| `write` | Works like a normal coding agent, still explains every change | Yes |

In every level:
- Small stuff (a typo, a missing bracket, formatting) is fixed directly, without a quiz.
- Markdown plans and notes may be written.
- Secrets are never written into files, `write` included.

## Levels: easy, medium, hard

How much help you get depends on how much you need. Pick your level with `/compass easy`, `/compass medium` or `/compass hard` (or `beginner`, `intermediate`, `senior`). `medium` is the default. The level is separate from the [code level](#code-level-how-much-code-you-get): the level decides how much Grandpa explains, the code level decides how much code you get.

| | easy (beginner) | medium (intermediate) | hard (senior) |
|---|---|---|---|
| **Explanations** | Every term and the error message, in plain words | The concept and the best practice behind it | Just the name of the problem |
| **Analogies** | Always, a little more detailed | One short one | Only when you ask |
| **Hints** | In small steps: where, then what, then how | Place, concept, direction | `file:line` and a direction |
| **Quiz** (code level `teach`) | 1–2 simple questions, often multiple choice | 1–3 questions | At most one, about design or trade-offs, or none |
| **Comments in code** | Almost every line | The why | Only where it's not obvious |
| **Extras** | What to run or check next | What to look up | Edge cases, complexity, other places with the same bug |
| **Reviews** | Top 3, explained in detail | Top 5 | Everything worth mentioning, one line each |

Worked examples at every level: [Levels in action](levels-in-action.md).
