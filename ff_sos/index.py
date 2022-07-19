import concurrent.futures
import requests
import typing

from pydantic import BaseModel

from bs4 import BeautifulSoup

NUM_WEEKS = 6

NUM_EXECUTORS = 8


class ScoreType(BaseModel):
    score: float
    picks: typing.List[str]
    teams: typing.List[str]


class PredictionType(BaseModel):
    probability: float
    pick: str


def main():
    team_names = get_team_names()
    with concurrent.futures.ThreadPoolExecutor(NUM_EXECUTORS) as executor:
        _predictions = executor.map(get_prediction, team_names)
        predictions = list(_predictions)
    scores: typing.List[ScoreType] = []
    for i in range(1, len(team_names)):
        for j in range(i):
            score = get_score(
                predictions[i],
                predictions[j],
                [team_names[k] for k in [i, j]],
            )
            scores.append(score)
    sorted_scores = sorted(
        scores,
        key=lambda score: score.score,
        reverse=True,
    )
    for score in sorted_scores:
        print(f"{score.score} = {','.join(score.teams)}")
        for pick in score.picks:
            print(f"\t+{pick}")


def get_team_names() -> typing.List[str]:
    resp = requests.get("https://www.espn.com/nfl/teams")
    soup = BeautifulSoup(resp.content, 'html.parser')
    hrefs = [i['href'] for i in soup.find_all('a', text='Schedule', href=True)]
    return sorted([
        href.split("/")[-1] for href in hrefs
        if href.startswith("/nfl/team/schedule")
    ])


def get_prediction(team_name: str) -> typing.List[PredictionType]:
    print(team_name)
    url = f"https://www.espn.com/nfl/team/schedule/_/name/{team_name}"
    resp = requests.get(url)
    soup = BeautifulSoup(resp.content, 'html.parser')
    hrefs = [i['href'] for i in soup.find_all('a', href=True)]
    game_links = [
        href for href in hrefs
        if href.startswith("https://www.espn.com/nfl/game/_/gameId/")
    ]

    def get_span_text(soup: BeautifulSoup, class_name: str) -> str:
        found = soup.find("span", {"class": class_name})
        assert found is not None
        return found.text

    def helper(link: str):
        soup = get_game_soup(link)

        raw_home_prob = get_span_text(soup, "value-home")
        home_prob = float(raw_home_prob[:-1])

        raw_away_prob = get_span_text(soup, "value-away")
        away_prob = float(raw_away_prob[:-1])

        # these are flipped in the page
        home_prob, away_prob = away_prob, home_prob

        home_team = get_span_text(soup, "home-team")
        away_team = get_span_text(soup, "away-team")
        if team_name == home_team.lower():
            probability = home_prob / (home_prob + away_prob)
            pick = f"{home_team} vs {away_team} = {home_prob}"
        else:
            probability = away_prob / (home_prob + away_prob)
            pick = f"{away_team} @ {home_team} = {away_prob}"
        return PredictionType(
            probability=probability,
            pick=pick,
        )

    return [helper(i) for i in game_links[:NUM_WEEKS]]


def memoize(f):
    d = {}

    def g(*args):
        if args in d:
            return d[args]
        v = f(*args)
        d[args] = v
        return v

    return g


@memoize
def get_game_soup(link: str) -> BeautifulSoup:
    resp = requests.get(link)
    soup = BeautifulSoup(resp.content, 'html.parser')
    return soup


def get_score(
    team_a: typing.List[PredictionType],
    team_b: typing.List[PredictionType],
    teams: typing.List[str],
) -> ScoreType:
    score = 0
    picks = []
    for i in range(len(team_a)):
        if team_a[i].probability > team_b[i].probability:
            team = team_a
        else:
            team = team_b

        p = team[i].pick
        s = team[i].probability
        s = 10 * (s - 0.5)
        s = s**3
        score += s
        picks.append(f"{p} -> {s}")
    return ScoreType(
        score=score,
        picks=picks,
        teams=teams,
    )


if __name__ == "__main__":
    main()
