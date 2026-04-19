import { serve } from "bun";
import "dotenv/config";
import { createApplication } from "./app";

async function main() {
  try {
    const PORT = process.env.PORT || 8080;

    const server = serve({
      port: PORT,
      fetch: createApplication as any,
    });

    console.log(`
    ██╗██████╗ ██╗███████╗
    ██║██╔══██╗██║██╔════╝
    ██║██████╔╝██║███████╗
    ██║██╔══██╗██║╚════██║
    ██║██║  ██║██║███████║
    ╚═╝╚═╝  ╚═╝╚═╝╚══════╝
    `);
    console.log(`Iris Auth Server is screaming fast on Bun!`);
    console.log(`URL: http://localhost:${PORT}`);
  } catch (error) {
    console.log(`Error starting bun server:`, error);
    process.exit(1);
  }
}

main();
