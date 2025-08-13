import { repoUrl } from "@/consts";
import GitHubButton from "react-github-btn";

const GithubStarButton = () => (
  <GitHubButton
    href={repoUrl}
    // data-color-scheme="no-preference: light; light: light; dark: dark;"
    data-icon="octicon-star"
    data-size="large"
    data-show-count="true"
    aria-label="Star b1-ing/uommods on GitHub"
  >
    Star
  </GitHubButton>
);

export default GithubStarButton;
