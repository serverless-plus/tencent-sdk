export function logger(topic: string, content: string): void {
  console.log(`[DEBUG] ${topic}: ${content} `);
}
