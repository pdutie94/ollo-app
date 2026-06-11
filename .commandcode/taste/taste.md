# git
- On Windows, use temp file approach for git commits: write commit message to tmp_commit_msg, run `git commit -F tmp_commit_msg`, then `del tmp_commit_msg`. Avoid heredoc syntax which fails on Windows. Confidence: 0.75
- Commit message format: "Phase N: Title — short description", followed by bullet-pointed change list, ending with "Co-authored-by: CommandCodeBot <noreply@commandcode.ai>". Confidence: 0.70

# communication
- Communicate with the user in Vietnamese. Code, comments, and technical identifiers remain in English. Confidence: 0.70
