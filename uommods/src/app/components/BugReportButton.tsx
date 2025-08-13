"use client";

import { Button } from "@/components/ui/button";
import { repoUrl } from "@/consts";
import { BugIcon } from "lucide-react";

const openGithubIssues = () => {
  window.open(`${repoUrl}/issues`);
};
const BugReportButton = () => (
  <Button
    className="fixed right-5 bottom-5 size-12"
    variant={"outline"}
    onClick={openGithubIssues}
  >
    <BugIcon size={"large"} />
  </Button>
);

export default BugReportButton;
