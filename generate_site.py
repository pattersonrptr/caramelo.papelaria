import argparse
import os
import shutil
import sys

import yaml
from jinja2 import Environment, FileSystemLoader, TemplateNotFound


def load_config(config_path: str) -> dict:
    """Load and validate the YAML configuration file."""
    if not os.path.exists(config_path):
        print(f"Error: Configuration file '{config_path}' not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with open(config_path, "r") as config_file:
            config = yaml.safe_load(config_file)
    except yaml.YAMLError as e:
        print(f"Error: Failed to parse '{config_path}': {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(config, dict):
        print(f"Error: '{config_path}' must contain a YAML mapping.", file=sys.stderr)
        sys.exit(1)

    required_keys = ["name", "bio", "meta", "links", "theme"]
    missing = [key for key in required_keys if key not in config]
    if missing:
        print(
            f"Error: Missing required keys in config: {', '.join(missing)}",
            file=sys.stderr,
        )
        sys.exit(1)

    required_meta_keys = ["lang", "description", "title", "author", "siteUrl"]
    missing_meta = [key for key in required_meta_keys if key not in config.get("meta", {})]
    if missing_meta:
        print(
            f"Error: Missing required keys under 'meta': {', '.join(missing_meta)}",
            file=sys.stderr,
        )
        sys.exit(1)

    if not isinstance(config.get("links"), list) or len(config["links"]) == 0:
        print("Error: 'links' must be a non-empty list.", file=sys.stderr)
        sys.exit(1)

    return config


def get_theme(config: dict, theme_override: str | None) -> str:
    """Determine which theme to use."""
    theme = theme_override or config.get("theme", "custom")
    theme_dir = os.path.join("themes", theme)
    if not os.path.isdir(theme_dir):
        print(
            f"Error: Theme '{theme}' not found. Expected directory: '{theme_dir}'",
            file=sys.stderr,
        )
        sys.exit(1)
    return theme


def generate_site(config_path: str, theme_override: str | None, output_dir: str) -> None:
    """Generate the static site from config and theme."""
    config = load_config(config_path)
    theme = get_theme(config, theme_override)

    # Override theme in config if --theme was provided
    if theme_override:
        config["theme"] = theme

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Configure Jinja2
    theme_dir = os.path.join("themes", theme)
    env = Environment(loader=FileSystemLoader(theme_dir))

    try:
        template = env.get_template("index.html")
    except TemplateNotFound:
        print(
            f"Error: Template 'index.html' not found in theme directory '{theme_dir}'.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Generate HTML file
    output_html = template.render(config=config)
    output_html_path = os.path.join(output_dir, "index.html")
    with open(output_html_path, "w") as fh:
        fh.write(output_html)

    # Copy assets folder to output directory
    assets_source = os.path.join(theme_dir, "assets")
    assets_dest = os.path.join(output_dir, "assets")
    if os.path.exists(assets_source):
        shutil.copytree(assets_source, assets_dest, dirs_exist_ok=True)
    else:
        print(
            f"Warning: No 'assets' folder found in theme '{theme}'. Skipping asset copy.",
            file=sys.stderr,
        )

    print(f"Site generated successfully in '{output_dir}/' using theme '{theme}'.")


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate a static link page from a YAML config and a Jinja2 theme.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_site.py
  python generate_site.py --config config.yml
  python generate_site.py --theme minimal
  python generate_site.py --config config.yml --theme minimal --output public
        """,
    )
    parser.add_argument(
        "--config",
        default="config.yml",
        help="Path to the YAML configuration file (default: config.yml)",
    )
    parser.add_argument(
        "--theme",
        default=None,
        help="Theme name to use, overrides the value set in config (e.g. custom, minimal)",
    )
    parser.add_argument(
        "--output",
        default="docs",
        help="Output directory for the generated site (default: docs)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    generate_site(
        config_path=args.config,
        theme_override=args.theme,
        output_dir=args.output,
    )


if __name__ == "__main__":
    main()
