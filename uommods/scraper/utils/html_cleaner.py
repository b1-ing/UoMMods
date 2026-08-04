from bs4 import BeautifulSoup


class HTMLCleaner:
    """
    Utility for converting raw HTML into clean text suitable for LLM extraction.
    """

    REMOVE_TAGS = (
        "script",
        "style",
        "svg",
        "noscript",
        "iframe",
        "img",
        "picture",
        "source",
        "video",
        "audio",
        "canvas",
        "form",
    )

    @classmethod
    def clean(
        cls,
        html: str,
    ) -> str:
        """
        Convert HTML into readable plain text.
        """

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        for tag in soup(cls.REMOVE_TAGS):
            tag.decompose()

        text = soup.get_text(
            separator="\n",
            strip=True,
        )

        return cls._normalize(text)

    @staticmethod
    def _normalize(
        text: str,
    ) -> str:
        """
        Remove blank lines and excessive whitespace.
        """

        lines = []

        for line in text.splitlines():

            line = " ".join(line.split())

            if line:
                lines.append(line)

        return "\n".join(lines)