from argparse import ArgumentParser
from collections import Counter
from glob import iglob
from os import path
from typing import Dict, List, Optional, Tuple

CaptionSet = Dict[str, List[str]]

def remove_tag(captions: CaptionSet, tag: str) -> None:
  for _key, tags in captions.items():
    if tag in tags:
      tags.remove(tag)


def add_tag(captions: CaptionSet, tag: str) -> None:
  for _key, tags in captions.items():
    if tag not in tags:
      tags.append(tag)


def replace_tag(captions: CaptionSet, replacements: List[Tuple[str, str]]):
    for _key, tags in captions.items():
      for src, rep in replacements:
        if src in tags:
          tags.remove(src)
          tags.append(rep)


def sort_tags(captions: CaptionSet) -> None:
  for key, tags in captions.items():
    tags.sort()


def check_tags():
  pass


def count_tags(captions: CaptionSet, log: Optional[bool] = True):
  counter = Counter()
  for key, tags in captions.items():
    counter.update(tags)

  if log:
    print('most common tags:', counter.most_common())

  return counter


def stat_tags(captions: CaptionSet):
  counts = count_tags(captions, log=False)

  for key, count in counts.most_common():
    ratio = float(count) / len(captions)
    ratio = round(ratio * 100, ndigits=2)
    print('tag %s appears %s%% of the time' % (key, ratio))


def parse_args():
  parser = ArgumentParser()
  parser.add_argument("--path", type=str)
  parser.add_argument("--ext", type=str)

  # ops
  parser.add_argument("--add", type=str, nargs="*", default=[])
  parser.add_argument("--remove", type=str, nargs="*", default=[])
  parser.add_argument("--replace", type=str, nargs="*", default=[])
  parser.add_argument("--sort", action="store_true")

  return parser.parse_args()


def load_captions(root: str, extension: str) -> CaptionSet:
  captions = {}

  for name in iglob(path.join(root, '**', f"*.{extension}"), recursive=True):
    with open(name, "r") as f:
      tags = f.readline()
      tags = tags.split(",")
      captions[name] = [tag.strip() for tag in tags]

  return captions


def save_captions(root: str, extension: str, captions: CaptionSet):
  for name, tags in captions.items():
    with open(path.join(root, f"{name}.{extension}"), "w") as f:
      f.write(", ".join(tags))


def main():
  args = parse_args()

  captions = load_captions(args.path, args.ext)

  for tag in args.add:
    add_tag(captions, tag)

  for tag in args.replace:
    replace_tag(captions, [pair.split("=") for pair in args.replace])

  for tag in args.remove:
    remove_tag(captions, tag)

  # count_tags(captions)
  stat_tags(captions)


if __name__ == "__main__":
  main()

