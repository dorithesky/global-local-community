import json
from pathlib import Path

from matching.scoring import final_score

ROOT = Path(__file__).resolve().parents[1]
TEST_SET = ROOT / 'benchmark_harness' / 'test_set.json'


def label(score: float) -> str:
    if score >= 0.96:
        return 'direct_match'
    if score >= 0.88:
        return 'near_direct_or_spacing_variant'
    if score >= 0.78:
        return 'likely_confusion'
    if score >= 0.68:
        return 'possible_confusion'
    return 'drop'


def main() -> None:
    tests = json.loads(TEST_SET.read_text())
    results = []
    passes = 0
    for item in tests:
        scores = final_score(item['query'], item['candidate'])
        passed = scores.final >= item['expected_min_score']
        passes += 1 if passed else 0
        results.append({
            'query': item['query'],
            'candidate': item['candidate'],
            'expected_min_score': item['expected_min_score'],
            'actual_score': round(scores.final, 3),
            'phonetic': round(scores.phonetic, 3),
            'edit': round(scores.edit, 3),
            'token': round(scores.token, 3),
            'label': label(scores.final),
            'passed': passed,
        })
    summary = {
        'total': len(tests),
        'passed': passes,
        'accuracy': round(passes / len(tests), 3) if tests else 0,
        'results': results,
    }
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
