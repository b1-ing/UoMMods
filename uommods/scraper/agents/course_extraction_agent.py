from bs4 import BeautifulSoup

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from models.unit_details import UnitDetails

from agents.prompts import SYSTEM_PROMPT


class CourseExtractionAgent:
    """
    Uses an LLM to extract structured course information from
    a University of Manchester course page.

    Responsibilities
    ----------------
    - Clean HTML.
    - Convert HTML into readable text.
    - Invoke the LLM.
    - Return a validated UnitDetails object.
    """

    def __init__(
        self,
        use_local: bool = True,
    ):

        if use_local:

            print(
                "[*] Configuring CourseExtractionAgent to use local model engine..."
            )

            self.llm_engine = ChatOpenAI(
                model="gemma3:4b",
                base_url="http://localhost:11434/v1",
                api_key="sk-your-key",
                temperature=0.0,
            )

        else:

            print(
                "[*] Configuring CourseExtractionAgent to use production OpenAI engine..."
            )

            self.llm_engine = ChatOpenAI(
                model="gpt-4.1",
                temperature=0.0,
            )

        self.llm = self.llm_engine.with_structured_output(UnitDetails)

        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                ("human", "{course_page}"),
            ]
        )

        self.chain = self.prompt | self.llm

    def extract(
        self,
        html: str,
    ) -> UnitDetails:
        """
        Extract a UnitDetails object from raw HTML.
        """

        cleaned_page = self._clean_html(html)

        return self.chain.invoke(
            {
                "course_page": cleaned_page,
            }
        )

    @staticmethod
    def _clean_html(
        html: str,
    ) -> str:
        """
        Remove unnecessary HTML before sending it to the LLM.
        """

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        for tag in soup(
            [
                "script",
                "style",
                "svg",
                "noscript",
                "iframe",
                "img",
            ]
        ):
            tag.decompose()

        text = soup.get_text(
            separator="\n",
            strip=True,
        )

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        return "\n".join(lines)