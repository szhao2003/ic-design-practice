import importlib.util
from decimal import Decimal
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "slack_summary", ROOT / "examples/python/slack_summary.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
summarize = module.summarize_slack


class SlackSummaryTests(unittest.TestCase):
    def test_question_example(self):
        result = summarize([
            "# report", "path=p0 slack=-0.12 ns", "path=p1 slack=-80 ps",
            "path=p2 slack=0 ns", "broken line",
        ])
        self.assertEqual(result, {
            "violations": 2, "worst_path": "p0",
            "worst_ns": Decimal("-0.12"), "invalid": 1,
        })

    def test_empty_and_nonnegative(self):
        for lines in [[], ["", " # comment "], ["path=a slack=-0 ns", "path=b slack=+1. ns"]]:
            self.assertEqual(summarize(lines), {
                "violations": 0, "worst_path": None, "worst_ns": None, "invalid": 0,
            })

    def test_exact_tie_and_repeated_path_count(self):
        result = summarize([
            "path=first slack=-100 ps", "path=second slack=-0.1 ns",
            "path=first slack=-.100 ns",
        ])
        self.assertEqual(result["violations"], 3)
        self.assertEqual(result["worst_path"], "first")
        self.assertEqual(result["worst_ns"], Decimal("-0.1"))

    def test_invalid_records_are_not_partial_matches(self):
        lines = [
            "path=a slack=-1 ns garbage", "prefix path=a slack=-1 ns",
            "path=a  slack=-1 ns", "path=a slack=nan ns", "path=a slack=Inf ns",
            "path=a slack=1e-3 ns", "path=a slack=-1 NS", "path= slack=-1 ns",
        ]
        result = summarize(lines)
        self.assertEqual(result["invalid"], len(lines))
        self.assertEqual(result["violations"], 0)

    def test_single_pass_iterator_and_decimal_formats(self):
        def lines():
            yield " path=a slack=-.5 ps \n"
            yield "path=b slack=-1. ns"
            yield "path=c slack=+.25 ns"
        result = summarize(lines())
        self.assertEqual(result["violations"], 2)
        self.assertEqual(result["worst_path"], "b")
        self.assertEqual(result["worst_ns"], Decimal("-1"))

    def test_units_and_integer_signs_against_exact_fraction_model(self):
        from fractions import Fraction
        records = []
        values = []
        for unit, denominator in [("ps", 1000), ("ns", 1)]:
            for value in range(-5, 6):
                path = f"{unit}_{value}"
                records.append(f"path={path} slack={value:+d} {unit}")
                values.append((path, Fraction(value, denominator)))
        result = summarize(iter(records))
        negative = [(path, value) for path, value in values if value < 0]
        expected_path, expected_value = min(negative, key=lambda pair: pair[1])
        self.assertEqual(result["violations"], len(negative))
        self.assertEqual(result["worst_path"], expected_path)
        self.assertEqual(Fraction(result["worst_ns"]), expected_value)


if __name__ == "__main__":
    unittest.main(verbosity=2)
