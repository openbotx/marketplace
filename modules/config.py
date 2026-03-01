import os

from modules import time

# general
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
build_dir = os.path.join(root_dir, "build")
template_dir = os.path.join(root_dir, "templates")

title = "OpenBotX Marketplace"
rtl = False
base_url = "https://openbotx-marketplace.pages.dev"

page_description = (
    "Discover and install skills for OpenBotX"
    " — browse, search, and download packages for your AI assistants."
)
page_keywords = (
    "openbotx, marketplace, skills, ai assistants, plugins,"
    " packages, open source, automation"
)
page_author = "Paulo Coutinho"
page_language = "en"

page_og_locale = "en_US"
page_og_type = "website"
page_og_site_name = title
page_og_image = f"{base_url}/assets/images/logo-og.png"
page_og_image_width = "1024"
page_og_image_height = "1024"

page_twitter_card = "summary_large_image"
page_twitter_site = "@openbotx"

page_apple_mobile_web_app_title = title
page_application_name = title

version_js_file = time.current_time()
version_css_file = time.current_time()
