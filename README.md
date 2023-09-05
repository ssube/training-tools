# Training Tools

A collection of miscellaneous tools and scripts for training ML models that do not belong in
[onnx-web](https://github.com/ssube/onnx-web).

## Notebooks

### LoRA Viz

Visualize the token weights in a Stable Diffusion LoRA network and/or prompt, show how they interact, and how the prompt
weights are changed by the LoRA (or vice versa).

## Scripts

### Crop Images

Resize, deduplicate, and randomly crop source images to produce a larger and more varied dataset.

Cropped outputs may not include the desired subject and should be checked by hand or with a CV model.

### Edit Captions

Edit all of the caption files in a directory at once.

Features:

- add, remove, or replace tags
- count tags and show how often they appear
- list files that do or do not have a particular tag
- sort tags
  - make sure you use the Shuffle Captions option when training
