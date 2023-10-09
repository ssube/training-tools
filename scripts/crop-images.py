from argparse import ArgumentParser
from glob import iglob
from logging import getLogger
from logging.config import dictConfig
from os import environ, path
from PIL import ImageOps
from PIL.Image import Image, open as pil_open, merge, Resampling
from torch.autograd import Variable
from torchvision.transforms import RandomCrop, Resize, Normalize, ToTensor
from typing import Any, List, Tuple
from yaml import safe_load

import torchvision.models as models
import torch.nn as nn


logging_path = environ.get("ONNX_WEB_LOGGING_PATH", "./logging.yaml")

try:
    if path.exists(logging_path):
        with open(logging_path, "r") as f:
            config_logging = safe_load(f)
            dictConfig(config_logging)
except Exception as err:
    print("error loading logging config: %s" % (err))

logger = getLogger(__name__)


def parse_args():
    parser = ArgumentParser()

    # paths
    parser.add_argument("--src", type=str)
    parser.add_argument("--dest", type=str)

    # image params
    parser.add_argument("--crops", type=int)
    parser.add_argument("--height", type=int, default=512)
    parser.add_argument("--width", type=int, default=512)
    parser.add_argument("--min", type=float, default=0.5)
    parser.add_argument("--scale", type=float, default=1.5)
    parser.add_argument("--threshold", type=float, default=0.75)
    parser.add_argument("--dry-run", action="store_true")

    return parser.parse_args()


def load_images(root: str) -> List[Tuple[str, Image]]:
    logger.info("loading images from %s", root)

    for name in iglob(path.join(root, '**', '*.jpg'), recursive=True):
        logger.info("loading image file: %s", name)
        prefix, _ext = path.splitext(name)
        prefix = path.basename(prefix)

        try:
            image = pil_open(name)
            image = ImageOps.exif_transpose(image)

            if image.mode == "L":
                image = merge("RGB", (image, image, image))

            logger.info("adding %s to sources", prefix)
            yield ((prefix, image))
        except:
            logger.exception("error loading image")


def save_images(root: str, images: List[Tuple[str, Image]], dry = False):
    for name, image in images:
        logger.info("saving image %s", name)

        if not dry:
            image.save(path.join(root, f"crop_{name}.jpg"))

    logger.info("saved %s images to %s", len(images), root)


def resize_images(images: List[Tuple[str, Image]], size: Tuple[int, int], min_scale: float) -> List[Tuple[str, Image]]:
    for name, image in images:
        scale = min(image.width / size[0], image.height / size[1])
        resize = (int(image.width / scale), int(image.height / scale))
        logger.info("resize %s from %s to %s (%s scale)", name, image.size, resize, scale)

        if scale < min_scale:
            logger.warning("image %s is too small: %s", name, image.size)
            continue

        yield (name, image.resize(resize, Resampling.LANCZOS))


resnet = models.resnet18(pretrained=True)

def remove_duplicates(sources: List[Tuple[str, Image]], threshold: float, vector_cache: List[Any]) -> List[Tuple[str, Image]]:
    model = resnet
    model.eval()

    # prepare transforms to make images resnet-compatible
    scaler = Resize((224, 224))
    normalize = Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    to_tensor = ToTensor()

    vectors = []
    for name, source in sources:
        source_tensor = Variable(normalize(to_tensor(scaler(source))).unsqueeze(0))
        vectors.append(model(source_tensor))

    similarity = nn.CosineSimilarity(dim=1, eps=1e-6)

    for (name, source), source_vector in zip(sources, vectors):
        cached = False
        for cache_vector in vector_cache:
            score = similarity(source_vector, cache_vector)
            logger.debug("similarity score for %s: %s", name, score)

            if score.max() > threshold:
                cached = True

        if cached == False:
            vector_cache.append(source_vector)
            yield (name, source)


def crop_images(sources: List[Tuple[str, Image]], size: Tuple[int, int], crops: int) -> List[Tuple[str, Image]]:
    transform = RandomCrop(size)

    for name, source in sources:
        logger.info("cropping %s", name)

        if source.width < size[0] or source.height < size[1]:
            logger.info("a small image leaked into the set: %s is %s", name, source.size)
            continue

        for i in range(crops):
            yield (f"{name}_{i}", transform(source))


def copy_captions(src: str, dest: str, src_name: str, dest_name: str, ext: str, dry = False):
    src_file = path.join(src, f"{src_name}.{ext}")
    dest_file = path.join(dest, f"crop_{dest_name}.{ext}")

    if path.exists(src_file):
        logger.info("copying caption file from %s", src_file)
        if not dry:
            with open(src_file, "r") as caption_src:
                with open(dest_file, "w") as caption_dest:
                    caption_dest.writelines(caption_src.readlines())
    else:
        logger.info("missing caption file for %s", src_file)


if __name__ == "__main__":
    args = parse_args()
    size = (int(args.width * args.scale), int(args.height * args.scale))

    # counters
    count_sources = 0
    count_resize = 0
    count_resize_dedupe = 0
    count_crop = 0
    count_crop_dedupe = 0

    # load unique sources
    source_cache = []
    crop_cache = []

    for source in load_images(args.src):
        logger.info("resizing source image %s", count_sources)
        count_sources += 1
        for resize in resize_images([source], size, args.min):
            logger.info("resized %s images, removing duplicates", count_resize)
            count_resize += 1
            for dedupe in remove_duplicates([resize], args.threshold, source_cache):
                count_resize_dedupe += 1
                for crop in crop_images([dedupe], (args.width, args.height), args.crops):
                    logger.info("cropped images: %s", count_crop)
                    count_crop += 1
                    for crop_dedupe in remove_duplicates([crop], args.threshold, crop_cache):
                        count_crop_dedupe += 1
                        save_images(args.dest, [crop_dedupe], args.dry_run)
                        copy_captions(args.src, args.dest, source[0], crop_dedupe[0], "txt", args.dry_run)

    logger.info("saved %s crops from %s sources", count_crop_dedupe, count_sources)
    logger.info("args: %s", args)
    logger.info("%s source images", count_sources)
    logger.info("%s images after size filter and resizing", count_resize)
    logger.info("%s images after resize and dedupe", count_resize_dedupe)
    logger.info("%s random crops", count_crop)
    logger.info("%s random crops after dedupe", count_crop_dedupe)
