# Levels in action

## Three LeetCode bugs, at every level

Each example below is a common mistake in a solution to a well-known LeetCode problem, shown at all three levels so you can compare. All of them use the default code level, `teach`: questions first, then the finished code.

**[1. Two Sum](https://leetcode.com/problems/two-sum/)**: find the two positions whose numbers add up to `target`. This solution passes `[2,7,11,15]` but returns `[0,0]` for `nums = [3,2,4], target = 6`.

```js
// src/twoSum.js
1  function twoSum(nums, target) {
2    const seen = new Map();
3    for (let i = 0; i < nums.length; i++) {
4      seen.set(nums[i], i);
5      const j = seen.get(target - nums[i]);
6      if (j !== undefined) return [j, i];
7    }
8  }
```

**[20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)**: check that every bracket is closed in the right order. This solution says `"(("` is valid.

```python
# src/valid_parentheses.py
 1  def is_valid(s: str) -> bool:
 2      pairs = {")": "(", "]": "[", "}": "{"}
 3      stack = []
 4      for ch in s:
 5          if ch in pairs:
 6              if not stack or stack.pop() != pairs[ch]:
 7                  return False
 8          else:
 9              stack.append(ch)
10      return True
```

**[704. Binary Search](https://leetcode.com/problems/binary-search/)**: find `target` in a sorted list. This solution returns `-1` for `nums = [5], target = 5`, and in `[-1,0,3,5,9,12]` it can't find `0`, `5` or `12`.

```js
// src/search.js
 1  function search(nums, target) {
 2    let lo = 0, hi = nums.length - 1;
 3    while (lo < hi) {
 4      const mid = Math.floor((lo + hi) / 2);
 5      if (nums[mid] === target) return mid;
 6      if (nums[mid] < target) lo = mid + 1;
 7      else hi = mid - 1;
 8    }
 9    return -1;
10  }
```

## easy: for beginners

<details>
<summary><b>easy · Two Sum</b>: "Why do I get <code>[0, 0]</code>?"</summary>

> **Grandpa:** Let's go step by step, kiddo. Open `src/twoSum.js` and look at lines 4 and 5.
>
> Two words first:
> - A **Map** is like a notebook: you write down a number and the position where you saw it, and later you can look it up.
> - **`target - nums[i]`** is the partner number you're hoping to find.
>
> Your loop writes the number into the notebook *first* (line 4) and looks for its partner *after* (line 5). With `nums = [3,2,4]` and `target = 6`, the first number is `3`, and its partner is also `3`. You just wrote `3` into the notebook, so you find… yourself. It's like looking for a dance partner and picking your own reflection in the mirror.
>
> One question, pick a letter: what should happen first in each round?
> a) write the number down, then look for the partner
> b) look for the partner, then write the number down
>
> **You:** b
>
> **Grandpa:** Exactly right. Here's the whole function, type it in yourself:
>
> ```js
> // src/twoSum.js
> function twoSum(nums, target) {
>   // Notebook: number -> the position where we saw it.
>   const seen = new Map();
>   // Look at every number once, from left to right.
>   for (let i = 0; i < nums.length; i++) {
>     // First look for the partner among the numbers we saw EARLIER...
>     const j = seen.get(target - nums[i]);
>     // ...if it's there, we have our pair: the earlier position, then ours.
>     if (j !== undefined) return [j, i];
>     // Only now write our own number down, so we can't pair with ourselves.
>     seen.set(nums[i], i);
>   }
> }
> ```
>
> Next step: run it with `[3,2,4]` and `6`. You should get `[1, 2]`. Well done.

</details>

<details>
<summary><b>easy · Valid Parentheses</b>: "Why is <code>"(("</code> valid?"</summary>

> **Grandpa:** Look at `src/valid_parentheses.py:10`, the very last line.
>
> - A **stack** is like a pile of plates: you put plates on top and take them off the top.
> - Every opening bracket goes on the pile (line 9). Every closing bracket takes the top one off and checks it matches (line 6).
>
> With `"(("`, two openers go on the pile and nothing ever takes them off. When the loop ends, two plates are still sitting there, but line 10 says `True` without looking. It's like checking out of a hotel while two rooms are still booked in your name.
>
> One question, pick a letter: when the loop is done, how many plates should be on the pile if the string is valid?
> a) none  b) one  c) it doesn't matter
>
> **You:** c?
>
> **Grandpa:** Not quite, and that's exactly the bug: it does matter. Any plate left over is an opening bracket that was never closed, so the answer is a) none. Here's the fix:
>
> ```python
> # src/valid_parentheses.py:10
> # Valid only if every opener was closed, i.e. the stack is empty again.
> # `not stack` is True for an empty list and False if anything is left.
> return not stack
> ```
>
> Next step: try `"(("` and `"["` again. Both should now say `False`.

</details>

<details>
<summary><b>easy · Binary Search</b>: "Why can't it find <code>5</code> in <code>[5]</code>?"</summary>

> **Grandpa:** Line 3 of `src/search.js`, kiddo.
>
> - **Binary search** is like finding a word in a dictionary: open it in the middle, decide if your word comes before or after, and throw away the half you don't need.
> - `lo` and `hi` are the first and last page you still have to search. Both pages are still possible answers.
>
> With `[5]`, `lo` is 0 and `hi` is 0: one page left, and it's the right one. But `while (lo < hi)` asks "is 0 smaller than 0?", gets "no", and stops before even looking. You closed the dictionary with one page still in your hand.
>
> One question, pick a letter: when `lo` and `hi` are the same number, how many pages are left to check?
> a) none  b) one  c) two
>
> **You:** b
>
> **Grandpa:** Right, one page, so the loop has to keep going. Here's the fix:
>
> ```js
> // src/search.js:3
> // Keep searching while there is at least one page left.
> // When lo === hi, exactly one page is left, so we still have to look at it.
> while (lo <= hi) {
> ```
>
> Next step: try `[5]` with `5`, and `[-1,0,3,5,9,12]` with `12`. You should get `0` and `5`. Nicely done.

</details>

## medium: for intermediates

<details>
<summary><b>medium · Two Sum</b>: "Why do I get <code>[0, 0]</code>?"</summary>

> **Grandpa:** `src/twoSum.js:4-5`. You insert `nums[i]` into the map before you look up its complement, so when `target` is twice a number, the element finds itself. A dancer who picks their own reflection as a partner.
>
> Two questions:
> 1. Why does `[2,7,11,15]` still work?
> 2. What order should insert and lookup have?
>
> **You:** Because 9 isn't twice any number in it. And lookup first, then insert.
>
> **Grandpa:** Both right.
>
> ```js
> // src/twoSum.js:4-6 — look up first, so a number can't pair with itself
> const j = seen.get(target - nums[i]);
> if (j !== undefined) return [j, i];
> seen.set(nums[i], i);
> ```
>
> Worth looking up: the "one-pass hash table" pattern, which this is.

</details>

<details>
<summary><b>medium · Valid Parentheses</b>: "Why is <code>"(("</code> valid?"</summary>

> **Grandpa:** `src/valid_parentheses.py:10`. You handle closers that have no opener (line 6), but not openers that never get closed: the stack can still hold items at the end. Checking out of a hotel with rooms still booked.
>
> Two questions:
> 1. What's on the stack after `"(("`?
> 2. What should line 10 return instead?
>
> **You:** Two `(`. And `len(stack) == 0`.
>
> **Grandpa:** Both right. The idiomatic way to write it:
>
> ```python
> # src/valid_parentheses.py:10 — valid only if every opener was closed
> return not stack
> ```
>
> Worth looking up: truthiness of empty containers in Python.

</details>

<details>
<summary><b>medium · Binary Search</b>: "Why can't it find <code>5</code> in <code>[5]</code>?"</summary>

> **Grandpa:** `src/search.js:3`. Your bounds are inclusive (`hi = nums.length - 1`, and line 7 sets `hi = mid - 1`), but the loop condition `lo < hi` is the one for an exclusive `hi`. When `lo === hi`, one candidate is left and you never check it. Closing the dictionary with one page still in your hand.
>
> Two questions:
> 1. With inclusive bounds, what does `lo === hi` mean?
> 2. Which condition matches inclusive bounds?
>
> **You:** One element left. `lo <= hi`.
>
> **Grandpa:** Both right.
>
> ```js
> // src/search.js:3 — inclusive bounds: lo === hi is still one candidate
> while (lo <= hi) {
> ```
>
> Worth looking up: the two standard binary search templates, inclusive `[lo, hi]` and half-open `[lo, hi)`, and keeping bounds and loop condition consistent.

</details>

## hard: for seniors

<details>
<summary><b>hard · Two Sum</b>: "Why do I get <code>[0, 0]</code>?"</summary>

> **Grandpa:** `src/twoSum.js:4`: insert before lookup, so `target = 2x` matches itself. Swap the order: look up, then insert.
>
> **You:** Show me.
>
> **Grandpa:**
>
> ```js
> // src/twoSum.js:4-6
> const j = seen.get(target - nums[i]);
> if (j !== undefined) return [j, i];
> seen.set(nums[i], i);
> ```
>
> Also: the function returns `undefined` when there's no pair. Fine for LeetCode's guarantee, not for real input.

</details>

<details>
<summary><b>hard · Valid Parentheses</b>: "Why is <code>"(("</code> valid?"</summary>

> **Grandpa:** `src/valid_parentheses.py:10`: unclosed openers are never checked. Return `not stack`.
>
> One question worth a minute: an odd-length string can never be valid. Would you add an early `len(s) % 2` exit, or keep the function minimal?
>
> **You:** Keep it minimal, it's O(n) either way.
>
> **Grandpa:** Fair.
>
> ```python
> # src/valid_parentheses.py:10
> return not stack
> ```

</details>

<details>
<summary><b>hard · Binary Search</b>: "Why can't it find <code>5</code> in <code>[5]</code>?"</summary>

> **Grandpa:** `src/search.js:3`: inclusive bounds with the half-open condition. Use `lo <= hi`, or switch to `hi = nums.length` and `hi = mid` throughout.
>
> ```js
> // src/search.js:3
> while (lo <= hi) {
> ```
>
> It misses any target the search narrows down to one candidate: in `[-1,0,3,5,9,12]` that's `0`, `5` and `12`. Test every element of a small array, not just one hit.

</details>
