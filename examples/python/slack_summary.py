import re
from decimal import Decimal


LINE = re.compile(
    r"path=(\S+) slack=([+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)) (ns|ps)"
)


def summarize_slack(lines):
    """Summarize complete records; keep the first path on exact decimal ties."""
    violations = 0
    invalid = 0
    worst_path = None
    worst_ns = None

    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        match = LINE.fullmatch(line)
        if match is None:
            invalid += 1
            continue

        path, number, unit = match.groups()
        # Append an exponent instead of converting through binary float.
        # Decimal construction is exact, including the ps -> ns scale change.
        slack_ns = Decimal(number + ("e-3" if unit == "ps" else ""))
        if slack_ns < 0:
            violations += 1
            if worst_ns is None or slack_ns < worst_ns:
                worst_path = path
                worst_ns = slack_ns

    return {
        "violations": violations,
        "worst_path": worst_path,
        "worst_ns": worst_ns,
        "invalid": invalid,
    }
