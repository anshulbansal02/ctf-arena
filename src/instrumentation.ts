export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrap } = await import("./bootstrap");
    await bootstrap();
  }
}
