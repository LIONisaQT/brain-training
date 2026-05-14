# MNIST Model

The handwriting recognition model is trained locally and served as a static
asset from `public/mnist_model/`. It is not committed to the repository.

## Requirements

- Python 3.10
- Homebrew (for installing Python 3.10 if needed: `brew install python@3.10`)

## First-time setup

Create two virtual environments — one for training, one for converting.
They need to be separate due to dependency conflicts.

### Training environment

```bash
python3.10 -m venv mnist_env
source mnist_env/bin/activate
pip install "tensorflow==2.13.0" keras
deactivate
```

### Conversion environment

```bash
python3.10 -m venv tfjs_convert_env
source tfjs_convert_env/bin/activate
pip install "tensorflow==2.13.0" "tensorflowjs==4.10.0"

# Patch broken imports in dependencies
sed -i '' 's/from pkg_resources import parse_version/from packaging.version import Version as parse_version/' \
  tfjs_convert_env/lib/python3.10/site-packages/tensorflow_hub/__init__.py

sed -i '' 's/from tensorflowjs.converters.jax_conversion import convert_jax//' \
  tfjs_convert_env/lib/python3.10/site-packages/tensorflowjs/converters/__init__.py

deactivate
```

## Regenerating the model

### 1. Train

```bash
source mnist_env/bin/activate
python3 train_mnist.py
deactivate
```

Training takes ~5–10 minutes. Target accuracy is ~99% by epoch 10.

### 2. Convert

```bash
source tfjs_convert_env/bin/activate
rm -rf public/mnist_model
tensorflowjs_converter \
  --input_format=keras \
  mnist_model.h5 \
  public/mnist_model
deactivate
```

### 3. Clean up intermediates

```bash
rm mnist_model.h5
```

## Output

`public/mnist_model/model.json` and its `.bin` shard files are served by
Vite at `/mnist_model/model.json`, matching the `MODEL_URL` constant in
`QuickMath.tsx`.

## Notes

- The two-venv setup is intentional. `tensorflowjs` 4.10.0 has broken
  transitive dependencies that conflict with the training environment.
- The two `sed` patches fix broken imports in `tensorflow_hub` and
  `tensorflowjs` that affect all known working version combinations on
  Python 3.10+. They must be re-applied if the venvs are recreated.
- The model is trained with data augmentation (rotation, zoom, shift) to
  improve tolerance of natural handwriting variation.
