# Caramelo Papelaria — Link Page Generator

A simple static site generator that builds a **personal link page** (similar to Linktree) from a YAML configuration file and Jinja2 HTML themes.

The generated site is a single `index.html` file with a list of clickable links, an avatar, a short bio, and automatic light/dark theme support — ready to be hosted for free on **GitHub Pages**.

---

## Demo

Live page: [https://pattersonrptr.github.io/caramelo.papelaria/](https://pattersonrptr.github.io/caramelo.papelaria/)

---

## How it works

```
config.yml          ← your data (name, bio, links, theme)
    │
    ▼
generate_site.py    ← reads config + renders Jinja2 template
    │
    ▼
docs/               ← generated site (index.html + assets)
```

1. Edit `config.yml` with your information and links.
2. Run `python generate_site.py`.
3. The ready-to-deploy site is written to `docs/`.

---

## Requirements

- Python 3.10+

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/pattersonrptr/caramelo.papelaria.git
cd caramelo.papelaria

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt
```

---

## Configuration

All site content is controlled by `config.yml`:

```yaml
name: "Caramelo Papelaria"
bio: "A papelaria mais doce que existe"

meta:
  lang: "pt_br"
  description: "A papelaria mais doce que existe"
  title: "Caramelo Papelaria"
  author: "Patterson"
  siteUrl: "https://pattersonrptr.github.io/caramelo.papelaria/"

links:
  - name: "Shopee"
    url: "https://shopee.com.br/pattriziaol"
  - name: "Instagram"
    url: "https://www.instagram.com/caramelo.papelaria/"
  - name: "Threads"
    url: "https://www.threads.com/@caramelo.papelaria"

theme: "custom"
```

| Field | Description |
|---|---|
| `name` | Display name shown as the page title |
| `bio` | Short description below the name |
| `meta.lang` | HTML language attribute (e.g. `pt_br`, `en`) |
| `meta.description` | Meta description for SEO |
| `meta.title` | Browser tab title |
| `meta.author` | Author name (shown in footer) |
| `meta.siteUrl` | Canonical URL of the published site |
| `links` | List of `name` + `url` pairs |
| `theme` | Theme folder name inside `themes/` |

---

## Generating the site

```bash
# Use defaults (config.yml, theme from config, output to docs/)
python generate_site.py

# Custom config file
python generate_site.py --config my_config.yml

# Override theme
python generate_site.py --theme minimal

# Custom output directory
python generate_site.py --output public

# All options together
python generate_site.py --config config.yml --theme minimal --output public
```

### CLI reference

| Argument | Default | Description |
|---|---|---|
| `--config` | `config.yml` | Path to the YAML configuration file |
| `--theme` | *(from config)* | Theme name; overrides the value in config |
| `--output` | `docs` | Output directory for the generated site |

---

## Themes

Themes live in the `themes/` directory. Each theme is a self-contained folder:

```
themes/
├── custom/          ← default theme (card-based, colorful)
│   ├── index.html
│   └── assets/
│       ├── css/styles.css
│       ├── js/script.js
│       └── img/
└── minimal/         ← minimal theme (clean typography)
    ├── index.html
    └── assets/
        ├── css/styles.css
        ├── js/script.js
        └── img/
```

Both themes support **automatic light/dark mode** via the CSS `prefers-color-scheme` media query.

### Creating a custom theme

1. Copy an existing theme folder: `cp -r themes/custom themes/my_theme`
2. Edit `themes/my_theme/index.html` and `assets/css/styles.css` as desired.
3. Reference it in `config.yml`: `theme: "my_theme"` or pass `--theme my_theme`.

The template has access to the entire `config` object:

| Variable | Example value |
|---|---|
| `{{ config.name }}` | `Caramelo Papelaria` |
| `{{ config.bio }}` | `A papelaria mais doce que existe` |
| `{{ config.meta.title }}` | `Caramelo Papelaria` |
| `{{ config.meta.author }}` | `Patterson` |
| `{% for link in config.links %}` | iterates over each link |
| `{{ link.name }}` | `Shopee` |
| `{{ link.url }}` | `https://shopee.com.br/…` |

---

## Adding a profile picture

Place your image at:

```
themes/<your_theme>/assets/img/picture.jpg
```

It will be copied to `docs/assets/img/picture.jpg` automatically when the site is generated.

---

## Running the tests

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=generate_site --cov-report=term-missing
```

---

## Publishing to GitHub Pages

1. Generate the site: `python generate_site.py`
2. Commit and push the `docs/` folder.
3. In the repository settings → **Pages**, set the source to the `docs/` folder on the `main` branch.

---

## Project structure

```
caramelo.papelaria/
├── config.yml              # Site configuration
├── generate_site.py        # Site generator script
├── pyproject.toml          # Project metadata and tool settings
├── requirements.txt        # Pinned dependencies
├── readme.md
├── docs/                   # Generated site output (for GitHub Pages)
├── themes/
│   ├── custom/             # Default theme
│   └── minimal/            # Minimal typography theme
└── tests/
    └── test_generate_site.py
```

---

## License

MIT
