import csv, io, json, re, subprocess, sys, unittest
from decimal import Decimal
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
QUESTIONS={q['id']:q for f in (ROOT/'src/data/questions').glob('*.json') for q in json.loads(f.read_text(encoding='utf-8'))}
def question(suffix): return QUESTIONS['ADAPTED-ARCHTOOLS-'+suffix]
class ArchToolsTests(unittest.TestCase):
 def test_csv_fixture_from_published_prompt(self):
  text=re.search(r'```text\s*\n(.*?)```',question('TOOLS-0001')['promptMd'],re.S).group(1)
  rows=list(csv.DictReader(io.StringIO(text,newline='')))
  self.assertEqual(len(rows),3);self.assertEqual(rows[0]['path'],'core,alu')
  self.assertEqual(sum(Decimal(r['slack_ns'])<0 for r in rows),2)
 def test_decimal_records_from_published_prompt(self):
  pairs=re.findall(r'\((p\d+),(-?\d+\.\d+)\)',question('TOOLS-0005')['promptMd'])
  negative=[p for p,s in pairs if Decimal(s)<0]
  self.assertEqual(len(pairs),5);self.assertEqual(len(negative),3)
  self.assertEqual(len(set(negative)),question('TOOLS-0005')['expectedValue'])
  self.assertEqual(Decimal('-0.00'),Decimal('0'))
 def test_filename_sorting_from_published_prompt(self):
  names=list(dict.fromkeys(re.findall(r'run\d+\.log',question('TOOLS-0004')['promptMd'])))
  self.assertEqual(sorted(names),['run1.log','run10.log','run2.log'])
  self.assertEqual(sorted(names,key=lambda n:int(n[3:-4])),['run1.log','run2.log','run10.log'])
 def test_real_subprocess_space_argument_and_failure(self):
  script='import sys,json; print(json.dumps(sys.argv[1:])); print("failure detail",file=sys.stderr); sys.exit(7)'
  args=[sys.executable,'-c',script,'--input','reports/run 1.csv']
  result=subprocess.run(args,capture_output=True,text=True,shell=False,check=False)
  self.assertEqual(json.loads(result.stdout),['--input','reports/run 1.csv'])
  self.assertEqual(result.returncode,7);self.assertIn('failure detail',result.stderr)
  with self.assertRaises(subprocess.CalledProcessError) as caught:
   subprocess.run(args,capture_output=True,text=True,shell=False,check=True)
  self.assertEqual(caught.exception.returncode,7);self.assertIn('failure detail',caught.exception.stderr)
if __name__=='__main__': unittest.main()
