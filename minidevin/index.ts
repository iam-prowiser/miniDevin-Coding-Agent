import { Command } from "commander";
import { spawn } from "node:child_process";

interface AttemptResult {
  piExitedSuccessfully: boolean;
  verificationPassed: boolean;
  verificationOutput: string;
  verificationExitCode: number | null;
}

function runAttempt(prompt: string): Promise<AttemptResult> {
  return new Promise((resolve) => {
    const child = spawn("pi", ["--print", prompt], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    child.on("error", (err) => {
      resolve({
        piExitedSuccessfully: false,
        verificationPassed: false,
        verificationOutput: `Failed to launch Pi: ${err.message}`,
        verificationExitCode: null,
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          piExitedSuccessfully: false,
          verificationPassed: false,
          verificationOutput: "",
          verificationExitCode: null,
        });
        return;
      }

      let verifyOutput = "";
      const verify = spawn("bun", ["run", "typecheck"], {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: process.cwd(),
      });

      verify.stdout?.on("data", (chunk) => {
        const str = chunk.toString();
        verifyOutput += str;
        process.stdout.write(str);
      });
      verify.stderr?.on("data", (chunk) => {
        const str = chunk.toString();
        verifyOutput += str;
        process.stderr.write(str);
      });

      verify.on("error", (err) => {
        resolve({
          piExitedSuccessfully: true,
          verificationPassed: false,
          verificationOutput: `Failed to launch verification: ${err.message}`,
          verificationExitCode: null,
        });
      });

      verify.on("close", (verifyCode) => {
        resolve({
          piExitedSuccessfully: true,
          verificationPassed: verifyCode === 0,
          verificationOutput: verifyOutput,
          verificationExitCode: verifyCode ?? null,
        });
      });
    });
  });
}

const program = new Command();

program
  .name("minidevin")
  .description("CLI tool to process user prompts")
  .version("1.0.0")
  .arguments("<prompt>")
  .action(async (prompt: string) => {
    const maxAttempts = 3;
    let attempt = 0;
    let currentPrompt = prompt;
    let succeeded = false;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Attempt ${attempt} of ${maxAttempts}`);

      const result = await runAttempt(currentPrompt);

      if (!result.piExitedSuccessfully) {
        console.log("Pi process did not exit successfully. Stopping.");
        break;
      }

      if (result.verificationPassed) {
        console.log("Verification passed.");
        succeeded = true;
        break;
      }

      // Don't retry if verification couldn't actually run (launch failure or signal)
      if (result.verificationExitCode === null) {
        console.log("Verification could not run. Stopping.");
        break;
      }

      currentPrompt = `${prompt}

Verification failed. Please fix the errors below while preserving the original task.

Previous verification output:
${result.verificationOutput}`;
    }

    if (!succeeded) {
      console.log("All attempts failed. Verification did not pass.");
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
