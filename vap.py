from typing import *


class Solution:

    def isSolvable(self, words: List[str], result: str) -> bool:
        if max([len(i) for i in words]) > len(result):
            return False
        ps = self.getPossibilities(words, result, {}, -1, 0)
        for p in ps:
            return True
        return False

    def getPossibilities(
        self,
        words: List[str],
        result: str,
        seen: Dict[str, int],
        index: int,
        carry: int,
    ) -> Iterator[Dict[str, int]]:
        letters = [
            word[index] for word in words + [result] if len(word) >= -index
        ]
        if len(letters) == 0:
            if carry == 0:
                yield dict(seen)
            return
        unseenLetters = [l for l in letters if l not in seen]
        if len(unseenLetters) == 0:
            total = sum([seen[l] for l in letters[:-1]]) + carry
            target = seen[letters[-1]]
            if total % 10 != target:
                return
            nextCarry = (total - target) / 10
            ps = self.getPossibilities(
                words,
                result,
                seen,
                index - 1,
                nextCarry,
            )
            for p in ps:
                yield p
        else:
            nextLetter = unseenLetters[0]
            for i in range(10):
                if i not in seen.values():
                    if i == 0 and len([
                            True for word in words + [result]
                            if (len(word) > 1 and word[0] == nextLetter)
                    ]) > 0:
                        continue
                    seen[nextLetter] = i
                    ps = self.getPossibilities(
                        words,
                        result,
                        seen,
                        index,
                        carry,
                    )
                    for p in ps:
                        yield p
                    del seen[nextLetter]


print(Solution().isSolvable(["SEND", "MORE"], "MONEY"))
