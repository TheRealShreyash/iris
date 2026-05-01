import http from "node:http";
import "dotenv/config";
import { createApplication } from "./app";

async function main() {
  try {
    const server = http.createServer(createApplication());
    const PORT = process.env.PORT || 9090;

    server.listen(PORT, () => {
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
    });
  } catch (error) {
    console.log(`Error starting bun server:`, error);
    process.exit(1);
  }
}

main();
